#!/bin/sh

gnome_ext_dir=$HOME/.local/share/gnome-shell/extensions/multimonitorswap@dvrlabs.tv
working_dir=`pwd`

echo "PULLING: \n" 
echo $gnome_ext_dir/* | tr " " "\n"
echo "\n-->"
echo ""
echo $working_dir
echo "\n"

cp -r $gnome_ext_dir/* $working_dir 
