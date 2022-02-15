# If the directory, `dist`, doesn't exist, create `dist`
stat dist || mkdir dist
# Archive artifacts
# zip dist/$npm_package_name.zip -r dist package.json package-lock.json
scp -i ~/.ssh/aws-ec2-east-1-nissan.pem -r dist/* ubuntu@54.156.42.84:/home/ubuntu/app-pipedrive-flux
scp -i ~/.ssh/aws-ec2-east-1-nissan.pem dist/.env ubuntu@54.156.42.84:/home/ubuntu/app-pipedrive-flux