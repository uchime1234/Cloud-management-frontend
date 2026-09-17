import os
import datetime

def combine_frontend(src_folder="src", output_file="frontend_combined.txt"):
    """
    Combines all frontend files from src folder into one text file.
    Shows folder and file names as headers.
    """

    # File extensions to include (matched against the FULL suffix chain,
    # so .module.css is treated as a distinct extension)
    EXTENSIONS = {'.jsx', '.js', '.css', '.scss', '.module.css', '.json', '.html', '.tsx', '.ts'}

    # Folders to exclude
    EXCLUDE_FOLDERS = {'node_modules', '.git', 'dist', 'build', '.vscode', '__pycache__', '.next'}

    # Files to exclude
    EXCLUDE_FILES = {output_file, '.DS_Store', 'Thumbs.db', 'package-lock.json', 'yarn.lock'}

    if not os.path.exists(src_folder):
        print(f"❌ Error: Folder '{src_folder}' does not exist!")
        return 0

    if not os.path.isdir(src_folder):
        print(f"❌ Error: '{src_folder}' is not a directory!")
        return 0

    total_files = 0
    total_folders = 0
    skipped_files = 0

    print(f"📁 Scanning folder: {src_folder}")
    print("=" * 60)

    with open(output_file, 'w', encoding='utf-8', errors='replace') as outfile:
        # Write header
        outfile.write("=" * 100 + "\n")
        outfile.write("FRONTEND CODE - COMBINED OUTPUT\n")
        outfile.write(f"Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        outfile.write(f"Source: {src_folder}\n")
        outfile.write("=" * 100 + "\n\n")

        # Walk through all directories and files
        for root, dirs, files in os.walk(src_folder):
            # Skip excluded folders (mutating dirs[:] prunes the walk)
            dirs[:] = [d for d in dirs if d not in EXCLUDE_FOLDERS]

            # Safety: skip if any part of the path is excluded
            path_parts = os.path.normpath(root).split(os.sep)
            if any(exclude in path_parts for exclude in EXCLUDE_FOLDERS):
                continue

            folder_had_files = False

            for file in files:
                if file in EXCLUDE_FILES:
                    continue

                # Handle multi-part extensions like .module.css
                lower_file = file.lower()
                file_ext = None
                for ext in sorted(EXTENSIONS, key=len, reverse=True):
                    if lower_file.endswith(ext):
                        file_ext = ext
                        break

                if file_ext is None:
                    continue

                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path)

                try:
                    folder_name = os.path.basename(root)
                    if os.path.abspath(root) == os.path.abspath(src_folder):
                        folder_name = "root"

                    # Write file header
                    outfile.write("=" * 100 + "\n")
                    outfile.write(f"📁 FOLDER: {folder_name}\n")
                    outfile.write(f"📄 FILE: {file}\n")
                    outfile.write(f"📌 PATH: {relative_path}\n")
                    outfile.write(f"📝 EXTENSION: {file_ext}\n")
                    outfile.write("=" * 100 + "\n\n")

                    # Read and write file content
                    content = None
                    for encoding in ('utf-8', 'latin-1'):
                        try:
                            with open(file_path, 'r', encoding=encoding) as infile:
                                content = infile.read()
                            break
                        except UnicodeDecodeError:
                            continue
                        except Exception as e:
                            outfile.write(f"⚠️ ERROR READING FILE: {e}\n")
                            content = None
                            break

                    if content is None:
                        outfile.write("⚠️ BINARY FILE OR UNREADABLE - CONTENT NOT DISPLAYED\n")
                        skipped_files += 1
                    else:
                        outfile.write(content)
                        total_files += 1
                        folder_had_files = True
                        print(f"  ✅ Added: {relative_path}")

                    outfile.write("\n\n")

                except Exception as e:
                    print(f"  ❌ Error reading {file}: {e}")
                    outfile.write(f"⚠️ ERROR: {e}\n\n")
                    skipped_files += 1

            if folder_had_files:
                total_folders += 1

    print("\n" + "=" * 60)
    print("✅ COMPLETED!")
    print(f"   📁 Processed {total_folders} folders")
    print(f"   📄 Combined {total_files} files")
    if skipped_files:
        print(f"   ⚠️  Skipped {skipped_files} unreadable files")
    print(f"   💾 Output saved to: {output_file}")
    print("=" * 60)

    return total_files


if __name__ == "__main__":
    combine_frontend("src", "frontend_combined.txt")