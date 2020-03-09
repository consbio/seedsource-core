from setuptools import find_packages, setup
from seedsource_core import __version__ as version

setup(
    name="seedsource-core",
    version=version,
    description="Core functionality underlying a collection of climate suitability tools.",
    author="Conservation Biology Institute",
    url="https://github.com/consbio/seedsource-core",
    license="BSD",
    packages=find_packages(),
    python_requires=">=3.5",
    install_requires=[
        "aiohttp",
        "trefoil",
        "django<2",
        "djangorestframework<3.8",
        "gdal==2.2.*",
        "geopy",
        "mercantile",
        "ncdjango==0.5.1",
        "netcdf4",
        "progress",
        "pyproj",
        "python-pptx",
        "weasyprint",
    ],
)
