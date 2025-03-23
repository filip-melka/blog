import frontmatter
import os
from datetime import datetime
import subprocess

today_date = datetime.today().strftime('%Y-%m-%d')

TARGET_DIR = "src/blog"

def get_files_by_status(status_code):
    try:
        output = subprocess.check_output(
            ["git", "diff", "--name-status", "HEAD~1", "HEAD"],
            text=True
        )
        lines = output.strip().splitlines()
        return [
            line.split("\t")[1]
            for line in lines
            if line.startswith(status_code) and line.endswith(".md") and line.split("\t")[1].startswith(TARGET_DIR)
        ]
    except subprocess.CalledProcessError:
        print("Probably first commit – fallback to git ls-files")
        return subprocess.check_output(
            ["git", "ls-files", TARGET_DIR],
            text=True
        ).strip().splitlines() if status_code == "A" else []

new_files = get_files_by_status("A")
modified_files = get_files_by_status("M")

print(new_files, modified_files)

def update_frontmatter(file_path, frontmatter_key, date_value):
    try:
        post = frontmatter.load(file_path)

        post.metadata[frontmatter_key] = date_value

        frontmatter.dump(post, file_path)
    except Exception as e:
        print(f"Error updating {file_path}: {e}")

for new_file in new_files:
    if new_file.endswith('.md'):
        update_frontmatter(new_file, 'pubDate', today_date)

for modified_file in modified_files:
    if modified_file.endswith('.md'):
        update_frontmatter(modified_file, 'updatedDate', today_date)