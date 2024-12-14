/********************************************************************************************************************************************************************
RdsStack and EcrStack need to be deployed before deploying this stack.
Once deployed go to the http://FargateEndpoint that prints after deployment and check the server is running.
********************************************************************************************************************************************************************/



import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import { DbCredentials } from '../types';
import * as dotenv from 'dotenv';
dotenv.config();



interface EcsStackProps extends cdk.StackProps {
  vpc: cdk.aws_ec2.Vpc;
  ecrRepository: ecr.Repository;
  dbCredentials: DbCredentials;
}



export class EcsStack extends cdk.Stack {
  
  private vpc: cdk.aws_ec2.Vpc; //the vpc rds is in
  private ecrRepository: cdk.aws_ecr.Repository;
  private dbCredentials: DbCredentials;
  private escTaskSecurityGroup: ec2.SecurityGroup;
  public ecsCluster: cdk.aws_ecs.Cluster;
  public taskDefinition: cdk.aws_ecs.TaskDefinition;
  public container: cdk.aws_ecs.ContainerDefinition;
  public fargateService: cdk.aws_ecs_patterns.ApplicationLoadBalancedFargateService


  constructor(scope: Construct, id: string, props: EcsStackProps) {
    super(scope, id, props);
    this.vpc = props.vpc;
    this.ecrRepository = props.ecrRepository;
    this.dbCredentials = props.dbCredentials;
    this.init();
  }


  private init() {
    this.createEcsSecurityGroup();
    this.createCluster();
    this.createTaskDefinition();
    this.addTaskDefRights();
    this.addContainerToTaskDef();
    this.addFargateService();
    this.scaleFargateService();
    this.outputFargateEndpoint();
  }

  private createEcsSecurityGroup() {
    this.escTaskSecurityGroup = new ec2.SecurityGroup(this, 'EcsTaskSecurityGroup', {
      vpc: this.vpc,
      description: 'Allow ECS tasks to communicate with RDS',
      allowAllOutbound: true,
    }); //add to Fargate like this: {..., securityGroups: [this.ecsTaskSecurityGroup]}
  }

  private createCluster() {
    this.ecsCluster = new ecs.Cluster(this, 'EcsCluster', {
      vpc: this.vpc, //must be in the same vpc as the rds
    });
  }

  private createTaskDefinition() {
    this.taskDefinition = new ecs.FargateTaskDefinition(this, 'NodeJsTask', {
      memoryLimitMiB: 512,
      cpu: 256,
    });
  }

  private addTaskDefRights() {
    this.taskDefinition.executionRole?.addManagedPolicy( //can pull image from ecr
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryReadOnly')
    );
    this.taskDefinition.executionRole?.addManagedPolicy( //can write to CloudWatch
      iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLogsFullAccess')
    );
    this.taskDefinition.taskRole.addToPrincipalPolicy( //can access rds secret in Secrets Manager
      new iam.PolicyStatement({
        actions: ['secretsmanager:GetSecretValue'],
        resources: [this.dbCredentials.secretArn],
      })
    );
  }

  private getEnvVars() {
    const rdsSecret = secretsmanager.Secret.fromSecretCompleteArn(this,'RdsSecret', this.dbCredentials.secretArn);
    return {
      NODE_ENV: 'production',
      PORT: '80',
      DB_HOST: this.dbCredentials.DB_HOST,
      DB_PORT: this.dbCredentials.DB_PORT,
      DB_USER: this.dbCredentials.DB_USER,
      DB_DATABASE: this.dbCredentials.DB_DATABASE,
      DB_PASSWORD: ecs.Secret.fromSecretsManager(rdsSecret, 'password')
    }
  }

  private addContainerToTaskDef() {
    const envVars = this.getEnvVars();
    this.container = this.taskDefinition.addContainer('NodeJsApiContainer', {
      image: ecs.ContainerImage.fromEcrRepository(this.ecrRepository),
      logging: ecs.LogDriver.awsLogs({ streamPrefix: 'NodeJsApi' }),
      environment: {
        NODE_ENV: envVars.NODE_ENV,
        PORT: envVars.PORT,
        DB_HOST: envVars.DB_HOST,
        DB_PORT: envVars.DB_PORT,
        DB_USER: envVars.DB_USER,
        DB_DATABASE: envVars.DB_DATABASE,
      },
      secrets: {
        DB_PASSWORD: envVars.DB_PASSWORD
      }
    });
    this.container.addPortMappings({ containerPort: 80 });
  }

  private addFargateService() {
    this.fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'FargateService', {
      cluster: this.ecsCluster,
      taskDefinition: this.taskDefinition,
      publicLoadBalancer: true,
      securityGroups: [this.escTaskSecurityGroup],
      assignPublicIp: true,
      listenerPort: 80,
      healthCheckGracePeriod: cdk.Duration.seconds(120), //delay after deployment before first check
      desiredCount: 1
    });
    this.fargateService.targetGroup.configureHealthCheck({
      path: '/health',
      interval: cdk.Duration.seconds(60),
      timeout: cdk.Duration.seconds(10),
      healthyThresholdCount: 2, //2 checks before considered healthy
      unhealthyThresholdCount: 2,
    });
  }

  private scaleFargateService() {
    const scaling = this.fargateService.service.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 2,
    });
    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 70,
    });
  }

  private outputFargateEndpoint() {
    new cdk.CfnOutput(this, 'FargateEndpoint', {
      value: this.fargateService.loadBalancer.loadBalancerDnsName,
      description: 'The endpoint of the ECS Fargate service',
    });
  }

}