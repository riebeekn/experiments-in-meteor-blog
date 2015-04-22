if [ ! -z $1 ]; then
	if [ "-d" = $1 ]; then
		build_drafts=true
	fi
fi

# Run Jekyll
if [ "$build_drafts" = true ]; then
	echo "-> Building site via Jekyll including draft posts"
	Jekyll b --drafts
else
	echo "-> Building site via Jekyll"
	Jekyll b
fi

# Upload to S3!
echo "-> Uploading to S3"
s3cmd sync --acl-public --cf-invalidate --delete-removed  _site/ s3://www.experimentsinmeteor.com/