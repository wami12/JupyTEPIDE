docker run -d \
  -p 5000:5000 \
  --name registry \
  -v /reg/registry/data:/var/lib/registry \
  --restart always \
  registry:2
