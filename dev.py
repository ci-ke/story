#!/usr/bin/env python3
"""
本地开发辅助脚本
从 main 分支提取 file_list/ 到当前目录，然后启动本地服务器

用法：python dev.py [端口]
"""

import subprocess
import sys
import os
import http.server
import socketserver
import shutil
import threading

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

# 从 main 分支提取 file_list/
print("从 main 分支提取 file_list/ ...")
result = subprocess.run(
    ['git', 'checkout', 'main', '--', 'file_list/'], capture_output=True, text=True
)
if result.returncode != 0:
    print(f"提取失败：{result.stderr}")
    sys.exit(1)

# 取消暂存，让 .gitignore 接管（file_list/ 已在 page 分支的 .gitignore 中）
subprocess.run(['git', 'restore', '--staged', 'file_list/'], capture_output=True)
print("提取完成，file_list/ 已取消暂存")


# 启动服务器
class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self) -> None:
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

    def do_OPTIONS(self) -> None:
        self.send_response(200)
        self.end_headers()

    def log_message(self, format: str, *args: object) -> None:
        pass  # 静默日志


httpd = socketserver.TCPServer(("", PORT), CORSRequestHandler)

print(f"服务目录：{os.path.abspath('.')}")
print(f"服务器运行在 http://localhost:{PORT}")
print("按 Ctrl+C 停止")

# 在子线程跑服务器，主线程保持可响应信号
t = threading.Thread(target=httpd.serve_forever, daemon=True)
t.start()

try:
    t.join()
except KeyboardInterrupt:
    print("\n清理 file_list/ ...")
    shutil.rmtree('file_list', ignore_errors=True)
    print("清理完成")
