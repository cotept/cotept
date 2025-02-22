#!/bin/bash

# .env 파일이 존재하는지 확인
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please copy .env.example to .env and update the values."
    exit 1
fi

# .env 파일의 각 라인을 읽어서 export
while read -r line; do
    # 주석이나 빈 줄 무시
    [[ $line =~ ^#.*$ ]] && continue
    [[ -z "$line" ]] && continue
    
    # 환경 변수로 export
    export "$line"
done < .env

echo "Environment variables loaded successfully!" 