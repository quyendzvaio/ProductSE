import os
import shutil
import subprocess
import sys
from pathlib import Path


def test_backend_import_does_not_require_untracked_directories(tmp_path):
    project_dir = Path(__file__).resolve().parents[2]
    shutil.copytree(project_dir / "backend" / "app", tmp_path / "backend" / "app")
    shutil.copytree(project_dir / "backend" / "data", tmp_path / "backend" / "data")
    shutil.copytree(project_dir / "backend" / "models", tmp_path / "backend" / "models")
    shutil.copytree(project_dir / "backend" / "static", tmp_path / "backend" / "static")
    shutil.copytree(project_dir / "data", tmp_path / "data")

    environment = {
        **os.environ,
        "PYTHONPATH": str(tmp_path / "backend"),
        "DATABASE_URL": "",
    }
    result = subprocess.run(
        [sys.executable, "-c", "from app.main import app; assert app"],
        cwd=tmp_path / "backend",
        env=environment,
        capture_output=True,
        text=True,
    )

    assert result.returncode == 0, result.stderr
