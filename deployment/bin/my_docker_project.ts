#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { RdsStack } from '../lib/rds-stack';
import { EcrStack } from '../lib/ecr-stack';
import { EcsStack } from '../lib/ecs-stack';
import { PipelineStack } from '../lib/pipeline-stack';
import * as dotenv from 'dotenv';
dotenv.config();


/**
vpc: ec2.Vpc;
  ecrRepositoryUri: string;
  ecrRepositoryArn: string;
  fargateServiceArn: string;
  ecsClusterArn: string;
  ecsClusterName: string;
 */


const region = process.env.AWS_REGION!;
const account = process.env.AWS_ACCOUNT!;
const githubRepo = process.env.GITHUB_REPO!;
const githubOwner = process.env.GITHUB_OWNER!;
const githubBranch = process.env.GITHUB_BRANCH!;
const githubTokenSecretArn = process.env.GITHUB_TOKEN_SECRET_ARN!;



const app = new cdk.App();

const rdsStack = new RdsStack(app, 'RdsStack', {env: {account, region}});

const ecrStack = new EcrStack(app, 'EcrStack', {env: {account, region}});

const ecsStack = new EcsStack(app, 'EcsStack', {
  env: {account, region},
  vpc: rdsStack.vpc,
  dbCredentials: rdsStack.dbCredentials,
  ecrRepository: ecrStack.ecrRepository
});

const pipelineStack = new PipelineStack(app, 'PipelineStack', {
  env: {account, region},
  vpc: rdsStack.vpc,
  ecrRepositoryUri: ecrStack.ecrRepository.repositoryUri,
  ecrRepositoryArn: ecrStack.ecrRepository.repositoryArn,
  ecsCluster: ecsStack.ecsCluster,
  ecsFargateService: ecsStack.fargateService,
  ecsTaskDefinition: ecsStack.taskDefinition,
  ecsContainer: ecsStack.container,
  githubRepo: githubRepo,
  githubOwner: githubOwner,
  githubBranch: githubBranch,
  githubTokenSecretArn: githubTokenSecretArn,
});