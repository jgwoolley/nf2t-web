#!/usr/bin/perl

use warnings;
use Data::Dumper;

my $master;
my $tree;

## MAIN BEGIN
# Test Input

my $list = {
    '1.0.0.0/24' => '24',
};

my $list_one = {
    
};

merge_routes();
my $flag = 1;
while ($flag == 1) 
{
    $flag = summarize_me();
}

print STDERR Dumper($master);

foreach my $record (sort(keys(%{$master})))
{
    print $master->{$record}{'ip_addr'} . "\n"; # new mask is part of ip address
}

## MAIN END

sub arrayToList {
    foreach my $i (@{$list_one}) {
        my @ip = split(/\//, $i);
        $list->{$ip[0]} = $ip[1];
    }
}

sub summarize_me {
    my $lastkey;
    my $change = 0;

    foreach my $i (sort(keys(%{$master}))) { # SORT the list stack IP's in binary
        # Can't compare to index -1 so set last value and move on
        if(!defined($lastkey)) {
            $lastkey = $i;
            next;
        }

        # If the previous record and curretn records binary mask are equal we could possibly collapse
        # mask is the binary representation of the mask
        if($master->{$lastkey}->{'mask'} eq $master->{$i}->{'mask'}) {
            #decrement the mask so /31 to /30
            #/31's and /32's need additional logic since the concept of networks dissappear #TODO
            my $new_mask = cidrtobin($master->{$i}->{'mask_addr'} -1); # Test to see if current and last networks are directly adjacent for summary

            print STDERR $master->{$i}->{'ip_addr'} . "\n";
            print STDERR $master->{$lastkey}->{'ip_addr'} . "\n";
            print STDERR $master->{$i}->{'ip'} . "\n";
            print STDERR $master->{$lastkey}->{'ip_addr'} . "\n";

            #if the ip in binary && with the mask for current record and last record are equal we can combine
            if($master)
        }
    }
}

sub merge_routes {

}