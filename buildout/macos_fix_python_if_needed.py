import sys
import platform
import subprocess
import pipes
import shutil


MAC_VER_FIX = r"""
def mac_ver(release='',versioninfo=('','',''),machine=''):
    try:
        v = __import__('plistlib').readPlist(
            '/System/Library/CoreServices/SystemVersion.plist'
        )['ProductVersion']
    except:
        return release,versioninfo,machine
    m = uname()[4]
    return (v, versioninfo, m)

"""

def macos_fix_python_if_needed(buildout):
    # platform.mac_ver() seems to be also defined on non-mac platforms,
    # but maybe not all? It's better to just try/except.
    try:
        version = int(platform.mac_ver()[0].split('.')[0])
        if version < 9999:
            return
    except:
        # Not on a mac
        return

    # We're on MacOS and platform.mac_ver() is broken!
    print >>sys.stderr, """\
%s appears to be broken!

EXPECTED:
>>> import platform
>>> platform.mac_ver()[0].split('.')[0]
'10'

GOT:
>>> import platform
>>> platform.mac_ver()[0].split('.')[0]
'%s'

But relax, we can fix it!
""" % (sys.executable, str(platform.mac_ver()[0].split('.')[0]))
    command = [
        '/usr/bin/sudo',
        sys.executable,
        __file__
    ]
    p = subprocess.Popen(command, stdin=sys.stdin)
    return_code = p.wait()
    if return_code:
        raise OSError('Command %s returned status code %i' % (
            ' '.join(
                [
                    pipes.quote(x)
                    for x in command
                ]
            ),
            return_code
        ))
    for x in [
        'bin-directory',
        'eggs-directory',
        'develop-eggs-directory',
        'parts-directory'
    ]:
        shutil.rmtree(buildout['buildout'][x], True)

    # Run bootstrap again
    args = []
    if 'bootstrap' in buildout:
        if 'args' in buildout['bootstrap']:
            args = [
                x.strip()
                for x in buildout['bootstrap']['args'].split('\n')
                if x != ''
            ]
    command = [
        sys.executable,
        'bootstrap.py'
    ] + args
    p = subprocess.Popen(command)
    return_code = p.wait()
    if return_code:
        raise OSError('Command %s returned status code %i' % (
            ' '.join(
                [
                    pipes.quote(x)
                    for x in command
                ]
            ),
            return_code
        ))

    # Run buildout again
    sys.exit(subprocess.Popen(sys.argv).wait())

if __name__ == '__main__':
    import os, platform
    platform_py = platform.__file__
    if platform_py.split('.')[-1] in ('pyc', 'pyo'):
        os.remove(platform_py)
        platform_py = '.'.join(platform_py.split('.')[:-1] + ['py'])
    if not os.path.exists(platform_py):
        raise OSError("%s not found!" % platform_py)
    open(platform_py, 'a').write(MAC_VER_FIX)
