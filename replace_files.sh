#!/bin/bash

# Root directory where the files are located
root_dir="/Users/rakeshpower/vs code/Internship/2 video project/test/abiv_nextjs/src/app/api"

# Function to rename directories
rename_directories() {
    local dir="$1"
    
    # Loop through all directories in the current directory
    for sub_dir in "$dir"/*; do
        if [ -d "$sub_dir" ]; then
            # If the directory name is '[d].ts', rename it to '[id]'
            if [[ "$(basename "$sub_dir")" == "[d].ts" ]]; then
                mv "$sub_dir" "$(dirname "$sub_dir")/[id]"
                echo "Renamed directory '$sub_dir' to '[id]'"
            fi
            # Recursively check subdirectories
            rename_directories "$sub_dir"
        fi
    done
}

# Start renaming process from the root directory
rename_directories "$root_dir"

echo "Renaming process completed!"
