#!/bin/sh

# Copyright 2023. Tushar Naik
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Author: Tushar Naik
# I've used a lot of shortcuts to try to simulate the release of a new version from local
# Don't kill me if this screws up in unnecessary places

# Does the following:
#1. automatically incrementing version in setup.py (required by setuptools for pypi distribution) and README.md
#2. setuptools and distribute on pypi
#3. create a docker image and push to docker repo tagged with the same version
#4. create a git tag
#5. finally push everything to remote

description=$1

if [ -z "$description" ]; then
  description="Releasing a new version"
fi

init=$(cat setup.py)
readme=$(cat README.md)
oldVersion=$(echo "$init" | egrep -o "version='[^']*" | sed "s/version='//g" | sed "s/'//g")
version=$(echo "$oldVersion" | awk -F. -v OFS=. 'NF==1{print ++$NF}; NF>1{if(length($NF+1)>length($NF))$(NF-1)++;$NF=sprintf("%0*d", length($NF), ($NF+1)%(10^length($NF))); print}') &&
  echo "$init" | sed "s/$oldVersion/$version/g" >setup.py &&
  echo "$readme" | sed "s/$oldVersion/$version/g" >README.md

echo "Current Version: $oldVersion"
echo "NEW VERSION: $version"
echo "STARTING RELEASE in 5 seconds...."
sleep 5
echo "Removing current distribution"
rm dist/*

# Commands below this have && which ensures that the next command only runs if the previous command was successful

echo "Setup tools running to create distribution"
python3 setup.py sdist &&
  echo "Twine upload starting.." &&
  python3 -m twine upload dist/* &&
  echo "Adding the changed version to git " &&
  git add setup.py &&
  git add README.md &&
  git commit -m "Auto incrementing version to $version" &&
  echo "Creating a git tag and pushing everything" &&
  git tag -a "v$version" -m "$description" &&
  git push &&
  git push origin "v$version" &&
  echo "...."
echo "...."
echo ".... DONE with RELEASE of $version"
