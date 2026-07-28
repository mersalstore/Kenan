import os
import sys
from crewai import Agent, Task, Crew, Process
from langchain_community.llms import Ollama

# Configure Ollama Local LLM
def get_llm():
    try:
        from langchain_ollama import OllamaLLM
        return OllamaLLM(model="qwen2.5-coder", base_url="http://localhost:11434")
    except ImportError:
        from langchain_community.llms import Ollama
        return Ollama(model="qwen2.5-coder", base_url="http://localhost:11434")

def main():
    print("🤖 Initializing Local Autonomous AI Agent (CrewAI + Ollama)...")
    llm = get_llm()

    # 1. Define AI Developer Agent
    developer_agent = Agent(
        role="Expert Python Developer & Automation Engineer",
        goal="Develop clean, efficient, and well-documented Python scripts and automation solutions.",
        backstory="""You are a senior AI software engineer specialized in building autonomous scripts, 
        automations, and system utilities using Python. You write high quality, self-contained code.""",
        verbose=True,
        allow_delegation=False,
        llm=llm
    )

    # 2. Define Code Reviewer Agent
    reviewer_agent = Agent(
        role="Senior Code Reviewer & Quality Auditor",
        goal="Review code written by the developer agent, check for bugs, and optimize execution.",
        backstory="""You are a meticulous lead auditor who ensures code is secure, scalable, 
        robust, and formatted cleanly.""",
        verbose=True,
        allow_delegation=False,
        llm=llm
    )

    # Prompt user for task input if provided via CLI or default
    task_prompt = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "Create a Python script that monitors CPU and RAM usage and logs alerts if usage exceeds 80%."

    print(f"\n🎯 Task to Execute: {task_prompt}\n")

    # 3. Create Tasks
    dev_task = Task(
        description=f"Write complete, working Python code to achieve the following goal: {task_prompt}",
        expected_output="Fully functional Python code with comments and clear explanations.",
        agent=developer_agent
    )

    review_task = Task(
        description="Review the generated Python code, verify correctness, and provide final improved output.",
        expected_output="Final polished Python code ready for execution.",
        agent=reviewer_agent
    )

    # 4. Form the Crew
    crew = Crew(
        agents=[developer_agent, reviewer_agent],
        tasks=[dev_task, review_task],
        process=Process.sequential
    )

    # 5. Kickoff Execution
    result = crew.kickoff()

    print("\n" + "="*50)
    print("✅ AI Agent Execution Completed Successfully!")
    print("="*50)
    print(result)

if __name__ == "__main__":
    main()
