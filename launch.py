import subprocess
import sys
import time

def main():
    print("Starting PG Management System...")
    
    # Start Backend
    print("Starting FastAPI Backend...")
    backend_process = subprocess.Popen(
        [r".\venv\Scripts\python.exe", "-m", "uvicorn", "main:app", "--reload", "--host", "127.0.0.1", "--port", "8000"],
        cwd=r".\backend",
        shell=True
    )
    
    # Wait a bit for backend to initialize
    time.sleep(3)
    
    # Start Frontend
    print("Starting React Frontend...")
    frontend_process = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=r".\frontend",
        shell=True
    )
    
    try:
        # Keep the main thread alive
        backend_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        print("\nShutting down servers...")
        backend_process.terminate()
        frontend_process.terminate()
        sys.exit(0)

if __name__ == "__main__":
    main()
