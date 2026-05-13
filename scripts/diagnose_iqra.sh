#!/bin/bash
echo "--- IQRA Sovereign Diagnostic ---"
echo "Time: $(date)"
echo "Memory Status:"
vm_stat | perl -ne '/page size of (\d+) bytes/ and $s=$1; /Pages\s+([^:]+)[^\d]+(\d+)/ and printf("%-15s %10.2f MB\n", $1, $2*$s/1048576);'

echo -e "\nOllama Status:"
ollama list
curl -s -I http://localhost:11434/api/tags | grep HTTP

echo -e "\nGo Engine Status (Port 8082):"
lsof -i :8082 || echo "Go Engine not listening on 8082"

echo -e "\nDisk Usage (.iqra):"
du -sh .iqra 2>/dev/null || echo ".iqra directory not found"

echo -e "\nTop Processes (CPU):"
ps -Ao pcpu,comm,pid -r | head -n 5
