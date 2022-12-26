#!/bin/sh

gnome_ext_dir=$HOME/.local/share/gnome-shell/extensions/multimonitorswap@dvrlabs.tv
working_dir=`pwd`/*

echo "Pushing $working_dir to $gnome_ext_dir"
cp -r $working_dir $gnome_ext_dir 

