//  Shahar Dil Se Surendra bhai mafi mangta hun
#!/bin/bash
FILES=$(find . -type f -not -path '*/.*' -not -path '*/node_modules/*' -not -path '*/dist/*' -not -path '*/git_backup_internal/*' -not -path '*/package-lock.json' -not -path '*/public/favicon.png' -not -path '*/public/image/*')

COMMENT=" Shahar Dil Se Surendra bhai mafi mangta hun"

for FILE in $FILES; do
    # Skip binary files
    if file "$FILE" | grep -q "text"; then
        EXT="${FILE##*.}"
        case "$EXT" in
            js|ts|json|css|scss)
                if [[ "$EXT" == "json" ]]; then
                   continue
                fi
                echo "// $COMMENT" | cat - "$FILE" > temp && mv temp "$FILE"
                ;;
            md|html)
                echo "<!-- $COMMENT -->" | cat - "$FILE" > temp && mv temp "$FILE"
                ;;
            *)
                echo "// $COMMENT" | cat - "$FILE" > temp && mv temp "$FILE"
                ;;
        esac
    fi
done
