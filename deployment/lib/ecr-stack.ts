/********************************************************************************************************************************************************************
When this stack is deployed for the first time you will need to push the backend docker image into the created ecr repo.
It's easy to do. Run these commands:

cd backend
aws ecr get-login-password --region us-east-1 --profile fhyahoo | docker login --username AWS --password-stdin <your-account-id>.dkr.ecr.us-east-1.amazonaws.com
docker build -t nodejs-api:latest .
docker tag nodejs-api:latest <your-account-id>.dkr.ecr.us-east-1.amazonaws.com/nodejs-api:latest
docker push <your-account-id>.dkr.ecr.us-east-1.amazonaws.com/nodejs-api:latest
*********************************************************************************************************************************************************************/



import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as dotenv from 'dotenv';
dotenv.config();



export class EcrStack extends cdk.Stack {
  
  public ecrRepository: cdk.aws_ecr.Repository;


  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);
    this.init();
  }


  private init() {
    this.createEcrRepository();
    this.outputEcrRepoUri();
  }

  private createEcrRepository() {
    this.ecrRepository = new ecr.Repository(this, 'NodeApiRepository', {
      repositoryName: 'nodejs-api',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      lifecycleRules: [{ maxImageAge: cdk.Duration.days(30) }],
    });
  }

  private outputEcrRepoUri() {
    new cdk.CfnOutput(this, 'EcrRepositoryUri', {
      value: this.ecrRepository.repositoryUri,
      description: 'The URI of the ECR repository',
    });
    new cdk.CfnOutput(this, 'EcrManualStep', {
      value: this.ecrRepository.repositoryUri,
      description: 'Please push a backend image into the ECR if this is the first time you ran this file',
    });
  }

}