# Deploy S3, ACM Certificate,CloudFront Distribution and Route 53 with AWS CDK

This repository contains AWS CDK TypeScript code that deploys an S3 bucket, an ACM certificate, a CloudFront distribution and Route 53 records. It's a work of [StormIT](https://www.stormit.cloud) and we cannot take responsibility for the consequences of using the provided code as it is ultimately the responsibility of the user to understand and use the code appropriately in their specific use case.

The price of using this solution depends on the actual usage, and AWS pricing models. It is recommended to review the [AWS pricing documentation](https://aws.amazon.com/pricing/) to understand the potential costs involved. 

If you don’t have a domain name yet, you’ll need to get one. This code is also prepared for you to already having a [public Route 53 hosted zone](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/CreatingHostedZone.html) with your domain name.

Read more in the code comments - file: [lib/cdk-example-s3-cloudfront-stack.ts](https://github.com/stormit-cloud/cdk-example-s3-cloudfront/blob/main/lib/cdk-example-s3-cloudfront-stack.ts)

## Prerequisites

- [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html#getting_started_install)
- [Node.js](https://nodejs.org/en/download/)
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-quickstart.html) configured on your local machine

## Installation

1. Clone the repository into your folder:
* `git clone https://github.com/stormit-cloud/cdk-example-s3-cloudfront`
* `cd cdk-example-s3-cloudfront`

2. Install dependencies:
* `npm install`

## Usage

1. Configure [AWS region](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html) that you want to use in `bin/cdk-example-s3-cloudfront.ts`. Default is Ireland(eu-west-1). CDK_DEFAULT_ACCOUNT is an environment variable that you can set to specify the default AWS account to use for your AWS CDK application. If you don't set this variable, the AWS CDK CLI will use the AWS account that is currently configured in the AWS CLI.

```javascript
env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'eu-west-1' }
```

2. Check website files in ['html-website'](https://github.com/stormit-cloud/cdk-example-s3-cloudfront/tree/main/html-website) folder. If you want you can exchange them for your static website files.

3. Configure your desired settings in `lib/cdk-example-s3-cloudfront-stack.ts`. 
Mainly your Domain name. You should already have [public Route 53 hosted zone](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/CreatingHostedZone.html) with your domain name.
```javascript
const domainName = 'your.domain';
```

You can also change the path to your error page in:
```javascript
responsePagePath: '/error/index.html';
```

4. Deploy the stack:
* `cdk deploy --all`

This will deploy the S3 bucket, ACM certificate, CloudFront distribution and Route 53 records.

## Clean Up
To delete the stack and all associated resources:
* `cdk destroy --all`

