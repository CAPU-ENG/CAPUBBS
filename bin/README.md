# SCRIPTS
1. DBbackup
	Backup mysql using "mysqldump" everyday, and delete data a week ago automatically.
2. tran
	Upload backup file everyday.

# USAGE
1. DBbackup: 	$0 [dump-file-dir]
2. tran: 	$0 [dump-file-dir] [target-dir]

# CRONTAB eg
> 0 4 * * * /PATH/TO/BDbackup /PATH/TO/DUMP-DIR
> 0 5 * * * /PATH/TO/tran /PATH/TO/DUMP-DIR
	
# IMPORTANT
CONFIG "conf" BEFORE USING !!!

# AUTHOR
Copyleft (c) 2015 Jack Ji <jiyuanyi1992@gmail.com>
