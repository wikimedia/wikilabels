import glob
import os.path
import re
import json

directory_path = os.path.dirname(__file__)

MESSAGES = {}
for filename in glob.glob(os.path.join(directory_path, "*.json")):
    lang_code = os.path.basename(filename).split(".")[0]
    file_loc = os.path.join(directory_path, os.path.basename(filename))
    MESSAGES[lang_code] = json.load(open(file_loc))


def i18n(key, langChain=[], arguments=[]):
    for lang_code in langChain + ['en']:
        if lang_code in MESSAGES and key in MESSAGES[lang_code]:
            return _format_str(MESSAGES[lang_code][key], arguments)

    return "<" + str(key) + ">"


def _format_str(message, arguments):
    def _format_args(match):
        i = int(match.group(1)) - 1
        if len(arguments) > i and i >= 0:
            return arguments[i]
        else:
            return match.group(0)
    return re.sub("\$([0-9]+)", _format_args, message)
