const { S3Client, ListObjectsCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const crypto = require("crypto");
const glob = require("glob");
const path = require("path");

async function compareETags(bucket, previousVersion) {
  if (!previousVersion) {
    return [];
  }

  const bundles = glob.sync("dist/script/*.js");

  const localEtags = {};
  const localFiles = [];
  bundles.forEach((bundlePath) => {
    let localFile = fs.readFileSync(bundlePath, "utf-8");
    localFile = localFile.replace("SEMANTIC_RELEASE_VERSION", previousVersion);
    const localHash = crypto.createHash("md5");
    localHash.update(localFile);
    const localEtag = localHash.digest("hex");
    localFiles.push(path.basename(bundlePath));
    localEtags[path.basename(bundlePath)] = localEtag;
  });
  console.log(localEtags);
  const s3 = new S3Client();
  const command = new ListObjectsCommand({
    Bucket: bucket,
    Prefix: "shopify/script",
  });
  const response = await s3.send(command);
  // {
  //   Key: 'shopify/script/checkout.banks-39.myshopify.com.js',
  //   LastModified: 2023-08-16T10:58:18.000Z,
  //   ETag: '"093d9ccdf04c68441ca2fc562da0d70f"',
  //   Size: 150745,
  //   StorageClass: 'STANDARD',
  //   Owner: [Object]
  // }
  const s3Objects = [];
  const s3ETags = {};
  response.Contents.forEach((content) => {
    const { Key, ETag } = content;
    const objectName = path.basename(Key);
    s3Objects.push(objectName);
    s3ETags[objectName] = ETag;
  });
  console.log(s3ETags);
  const bundlesNotListed = localFiles.filter((name) =>
    s3Objects.find((_) => _ === name) ? false : true
  );
  const bundlesListed = localFiles.filter((name) =>
    s3Objects.find((_) => _ === name) ? true : false
  );
  // Format issue, needs to add quotation marks
  const bundlesUpdated = bundlesListed.filter((name) =>
    `"${localEtags[name]}"` !== s3ETags[name] ? true : false
  );

  const result = [...bundlesNotListed, ...bundlesUpdated];
  console.log(result);
  return result;
}

module.exports = {
  compareETags,
};
