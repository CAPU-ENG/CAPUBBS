# IMPORTANT
CONFIG "conf" BEFORE USING !!!
Espescially "working directory" !

# CHANGELOG
2015.04.16 Using gzip instead of tar.To unzip:
> $ gunzip *.sql.gz

2015.03.23 Creating.

# SCRIPTS
1. DBbackup
	Backup mysql using "mysqldump" everyday, and delete data a week ago automatically.
2. tran
	Upload backup file everyday.
3. makecron
	Make crontab automatically.

# USAGE
1. DBbackup: 	$0 [dump-file-dir]
2. tran: 	$0 [dump-file-dir] [target-dir]
3. makecron: 	$0

# AUTHOR
Copyleft (c) 2015 Jack Ji <jiyuanyi1992@gmail.com>
