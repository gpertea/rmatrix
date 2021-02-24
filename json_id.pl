#!/usr/bin/perl
use strict;
use Getopt::Std;

my $usage = q/Usage:
  json_id.pl -n <obj_id> columns.tab

  writes an object of this format:
    { "obj_id" : [
      [ col1, col2, ... ],
      ...
     ]}
    There is a single property <obj_id> which has an array of arrays
    (each innermost array is a row, with columns as its elements)
/;

getopts('hn:') || die($usage."\n");
die($usage."\n") if $Getopt::Std::opt_h;

my $id=$Getopt::Std::opt_n || die("$usage\nError: object id must be given!\n");

print "{ \"$id\": [\n";
while (<>) {
  chomp;
  my @t=split(/\t/);
  foreach my $f (@t) {
    unless ( $f=~m/^[\-\.\d]+$/ && $f ne '.' && $f ne '-') {
      $f='"'.$f.'"';
    }
  }
  print "[ ".join(', ',@t)." ],\n";
}
print "]}\n";
