<?php
// Retired homepage download endpoints; keep old URLs from querying the database.
http_response_code(410);
header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-store');
echo '下载资料页面已停用。';
exit;
