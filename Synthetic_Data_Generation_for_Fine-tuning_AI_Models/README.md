# Synthetic Data Generation for Fine-tuning AI Models

**Course Instructors:**  *Ben Burtenshaw and David Berenstein*
**Learning Platform:** *[Uplimit](https://uplimit.com/)*

## Environment Setup

```bash
python -V
# Output: Python 3.12.1
```

```bash
# create a environment named -> data-generation-ai
python -m venv data-generation-ai
```

```bash
# activate the environment
source data-generation-ai/bin/activate
```
```bash
# deactivate the virtual environment
deactivate

```
```bash
# create a Jupyter Notebook kernel
pip install jupyter ipykernel

```
```bash
# add the virtual environment as a kernel for a jupyter notebook
python -m ipykernel install --user --name=data-generation-ai --display-name="Py3.12-data-generation-ai"

```
```bash
# verify kernel installation
jupyter kernelspec list

```

```bash
# If needed
jupyter kernelspec uninstall data-generation-ai

```