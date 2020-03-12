from django.conf import settings

SEEDZONES_LOCATION = getattr(settings, "SEEDZONES_LOCATION", "data/seedzones")

VARIABLES = (
    "AHM",
    "CMD",
    "DD5",
    "DD_0",
    "EMT",
    "Eref",
    "EXT",
    "FFP",
    "MAP",
    "MAT",
    "MCMT",
    "MSP",
    "MWMT",
    "PAS",
    "SHM",
    "TD",
)
