import sys
import subprocess
import os
import json
import urllib.request

OLLAMA_API = "http://localhost:11434/api/generate"
MODEL_NAME = "qwen2.5-coder"

def execute_cmd(cmd):
    """Execute PowerShell / System command and return output."""
    try:
        res = subprocess.run(["powershell", "-Command", cmd], capture_output=True, text=True, timeout=60)
        out = res.stdout if res.returncode == 0 else f"ERROR:\n{res.stderr}"
        return out
    except Exception as e:
        return f"Execution Failed: {str(e)}"

def create_file(filepath, content):
    """Create or overwrite a file with specified content."""
    try:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        return f"File '{filepath}' created successfully."
    except Exception as e:
        return f"Failed to create file: {str(e)}"

def query_ollama(prompt, system_prompt="You are an autonomous AI Agent assistant. Help the user accomplish tasks by executing commands and creating scripts."):
    """Send prompt to local Ollama instance."""
    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "system": system_prompt,
        "stream": False
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(OLLAMA_API, data=data, headers={"Content-Type": "application/json"})
    
    try:
        with urllib.request.urlopen(req) as resp:
            res = json.loads(resp.read().decode("utf-8"))
            return res.get("response", "")
    except Exception as e:
        return f"Error contacting Ollama model '{MODEL_NAME}': {str(e)}"

def run_agent_loop(task_description):
    print("\n" + "="*60)
    print(f"🤖 Autonomous Local AI Agent Started")
    print(f"🎯 Task: {task_description}")
    print("="*60 + "\n")
    
    system_prompt = """You are an Autonomous AI Agent running locally on Windows.
Your goal is to solve the user's task step-by-step.
Return your thought process and clear executable solutions.
"""
    
    response = query_ollama(f"User Task: {task_description}\n\nPlease analyze this task and provide a step-by-step solution or Python code to execute it.", system_prompt)
    
    print("\n🧠 AI Agent Solution / Output:\n")
    print(response)
    print("\n" + "="*60)
    print("✅ Execution Complete")

if __name__ == "__main__":
    task = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "Create a Python script that organizes files in a folder by extension."
    run_agent_loop(task)
