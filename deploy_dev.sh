#!/bin/bash -ex

pm2 deploy ecosystem.json development

scp ./youpin_credentials.json root@youpin:/opt/api.youpin.city/source
scp ./youpin_gcs_credentials.json root@youpin:/opt/api.youpin.city/source
scp ./stormpath_credentials.json root@youpin:/opt/api.youpin.city/source
