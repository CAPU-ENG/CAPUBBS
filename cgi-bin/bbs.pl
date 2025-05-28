#!/usr/bin/perl -w
my %FORM;

my $buffer=$ENV{'QUERY_STRING'};
my @pairs=split(/&/,$buffer);

foreach my $pair (@pairs)
{
	my ($name, $value) = split(/=/, $pair);
	$value =~ tr/+/ /;
	$value =~ s/%(..)/pack("C", hex($1))/eg;
	$FORM{$name} = $value;
}
my $id=$FORM{'id'};
my $see=$FORM{'see'};
my $b=$FORM{'b'};
my $p=$FORM{'p'};
$p="1" if ($p eq "");

$b=getb($id) if ($b eq "");

if ($see eq "" || $b eq "") {
	print "Content-type: text/html\n\n<HTML><HEAD><META HTTP-EQUIV='Refresh' CONTENT='1;URL=/bbs/index/'></HEAD></HTML>";
	exit;
}

my $tid=getsee($see);
my $url="/bbs/content/?bid=".$b."&tid=".$tid."&p=".$p;

#print "Content-type: text/html\n\n<HTML>";
#print $url;
print "Content-type: text/html\n\n<HTML><HEAD><META HTTP-EQUIV='Refresh' CONTENT='1;URL=$url'></HEAD></HTML>";
exit;


sub getb {
	my $id=$_[0];
	return 1 if ($id eq "act");
	return 2 if ($id eq "capu");
	return 3 if ($id eq "bike");
	return 4 if ($id eq "water");
	return 5 if ($id eq "acad");
	return 6 if ($id eq "asso");
	return 7 if ($id eq "skill");
	return 9 if ($id eq "race");
	return "";
}

sub getsee {
	my $see=$_[0];
	my $pid=1;
	$pid=$pid+(ord(substr($see,0,1))-ord('a'))*26*26*26;
	$pid=$pid+(ord(substr($see,1,1))-ord('a'))*26*26;
	$pid=$pid+(ord(substr($see,2,1))-ord('a'))*26;
	$pid=$pid+(ord(substr($see,3))-ord('a'));
	return $pid;
}
