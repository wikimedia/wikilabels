import os

from setuptools import find_packages, setup


def read(fname):
    return open(os.path.join(os.path.dirname(__file__), fname)).read()


def requirements(fname):
    return [line.strip()
            for line in open(os.path.join(os.path.dirname(__file__), fname))]


setup(
    name="wikilabels",
    version="0.4.1",  # Update in wikilabels/__init__.py
    author="Aaron Halfaker",
    author_email="ahalfaker@wikimedia.org",
    description="A generalized data labeling system for use in MediaWiki " + \
                "wikis",
    license="MIT",
    url="https://github.com/halfak/Wiki-Labels",
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    entry_points={
        'console_scripts': [
            'wikilabels=wikilabels.wikilabels:main',
        ],
    },
    long_description=read('README.md'),
    install_requires=requirements('requirements.txt'),
    classifiers=[
        "Programming Language :: Python :: 3",
        "Development Status :: 3 - Alpha",
        "License :: OSI Approved :: MIT License",
        "Intended Audience :: Science/Research",
        "Intended Audience :: System Administrators",
        "Intended Audience :: Developers",
        "Operating System :: OS Independent",
        "Topic :: Utilities",
        "Topic :: Scientific/Engineering"
    ]
)
