from ctypes import *
from pathlib import Path

dll = WinDLL(r"C:\Games\Diablo II\ProjectD2-Realm\StormLib.dll")

SFileOpenArchive = dll.SFileOpenArchive
SFileOpenArchive.argtypes = [c_wchar_p, c_uint, c_uint, POINTER(c_void_p)]
SFileOpenArchive.restype = c_bool

SFileOpenFileEx = dll.SFileOpenFileEx
SFileOpenFileEx.argtypes = [c_void_p, c_char_p, c_uint, POINTER(c_void_p)]
SFileOpenFileEx.restype = c_bool

SFileGetFileSize = dll.SFileGetFileSize
SFileGetFileSize.argtypes = [c_void_p, POINTER(c_uint)]
SFileGetFileSize.restype = c_uint

SFileReadFile = dll.SFileReadFile
SFileReadFile.argtypes = [c_void_p, c_void_p, c_uint, POINTER(c_uint), c_void_p]
SFileReadFile.restype = c_bool

SFileCloseFile = dll.SFileCloseFile
SFileCloseFile.argtypes = [c_void_p]
SFileCloseFile.restype = c_bool

SFileCloseArchive = dll.SFileCloseArchive
SFileCloseArchive.argtypes = [c_void_p]
SFileCloseArchive.restype = c_bool

hMpq = c_void_p()
ok = SFileOpenArchive(r"C:\Games\Diablo II\ProjectD2-Realm\pd2data.mpq", 0, 0, byref(hMpq))
print("open archive", ok, hMpq.value)
if not ok:
	raise SystemExit(1)

out = Path(__file__).resolve().parent / "data" / "global" / "excel"
out.mkdir(parents=True, exist_ok=True)

for rel in [
	b"data\\global\\excel\\Levels.txt",
	b"data\\global\\excel\\LvlWarp.txt",
	b"data\\global\\excel\\Objects.txt",
]:
	hFile = c_void_p()
	ok = SFileOpenFileEx(hMpq, rel, 0, byref(hFile))
	print("open", rel, ok)
	if not ok:
		continue
	hi = c_uint(0)
	size = SFileGetFileSize(hFile, byref(hi))
	print(" size", size)
	buf = create_string_buffer(size)
	read = c_uint(0)
	ok = SFileReadFile(hFile, buf, size, byref(read), None)
	print(" read", ok, read.value)
	name = rel.decode("latin1").split("\\")[-1]
	(out / name).write_bytes(buf.raw[: read.value])
	SFileCloseFile(hFile)

SFileCloseArchive(hMpq)
print("done", out)
