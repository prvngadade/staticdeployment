import * as route53 from 'aws-cdk-lib/aws-route53';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as cloudfront_origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

import { BlockPublicAccess, BucketAccessControl } from 'aws-cdk-lib/aws-s3';

import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class InfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

  // 1. Define the domain name by changing'stormit.link'.
  const domainName = 'stormit.link';
  const siteDomain = 'www' + '.' + domainName;

    // 1.1 Create a Route 53 hosted zone (optional - you will need to update the NS records).
    /*
    const hostedZone = new route53.PublicHostedZone(this, 'MyHostedZone', {
        zoneName: domainName,
        });
          
    new CfnOutput(this, 'Site', { value: 'https://' + siteDomain });
    */

    // 1.2 Find the current hosted zone in Route 53 
      const zone = route53.HostedZone.fromLookup(this, 'Zone', { domainName: domainName });
      console.log(zone);
    
  // 2. Create a TLS/SSL certificate for HTTPS
        const certificate = new acm.DnsValidatedCertificate(this, 'SiteCertificate', {
          domainName: domainName,
          subjectAlternativeNames: ['*.' + domainName],
              hostedZone: zone,
              region: 'us-east-1', // Cloudfront only checks this region for certificates
        });

    // 2.1 The removal policy for the certificate can be set to 'Retain' or 'Destroy'
        certificate.applyRemovalPolicy(RemovalPolicy.DESTROY)

        new CfnOutput(this, 'Certificate', { value: certificate.certificateArn });
    

  // 3. Create an S3 bucket to store content, and set the removal policy to either 'Retain' or 'Destroy'
    // Please be aware that all content stored in the S3 bucket is publicly available.
        const siteBucket = new s3.Bucket(this, 'SiteBucket', {
          bucketName: siteDomain,
          publicReadAccess: true,
          removalPolicy: RemovalPolicy.DESTROY,
          autoDeleteObjects: true,
          blockPublicAccess: BlockPublicAccess.BLOCK_ACLS,
          accessControl: BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
          websiteIndexDocument: 'index.html',
          websiteErrorDocument: 'error/index.html'})

          new CfnOutput(this, 'Bucket', { value: siteBucket.bucketName });

  // 4. Deploy CloudFront distribution
        const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
          certificate: certificate,
          defaultRootObject: "index.html",
          domainNames: [siteDomain, domainName],
          minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
          errorResponses:[
            {
              httpStatus: 404,
              responseHttpStatus: 404,
              responsePagePath: '/error/index.html',
              ttl: Duration.minutes(30),
            }
          ],
          defaultBehavior: {
            origin: new cloudfront_origins.S3Origin(siteBucket),
            compress: true,
            allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
            viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          }
        });

        new CfnOutput(this, 'DistributionId', { value: distribution.distributionId });

  // 5. Create a Route 53 alias record for the CloudFront distribution
        //5.1  Add an 'A' record to Route 53 for 'www.example.com'
        new route53.ARecord(this, 'WWWSiteAliasRecord', {
          zone,
          recordName: siteDomain,
          target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution))
        });
        //5.2 Add an 'A' record to Route 53 for 'example.com'
        new route53.ARecord(this, 'SiteAliasRecord', {
          zone,
          recordName: domainName,
          target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution))
        });

    //6. Deploy the files from the 'html-website' folder in Github to an S3 bucket
        new s3deploy.BucketDeployment(this, 'DeployWebsite', {
          sources: [s3deploy.Source.asset('./html-website')],
          destinationBucket: siteBucket,
        });
  }
}
