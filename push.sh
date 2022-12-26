#!/bin/sh

gnome_ext_dir=$HOME/.local/share/gnome-shell/extensions/multimonitorswap@dvrlabs.tv
working_dir=`pwd`

echo "PUSHING: \n" 
echo $working_dir/* | tr " " "\n"
echo "\n-->"
echo ""
echo $gnome_ext_dir
echo "\n"

cp -r $working_dir/*  $gnome_ext_dir
