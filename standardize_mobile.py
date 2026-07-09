#!/usr/bin/env python3
import shutil
from pathlib import Path

repo = Path("/Users/sam/Code/dailygenre")

# Fix studio-polish.js
studio = repo / "assets/js/studio-polish.js"
if studio.exists():
    with open(studio, 'r', encoding='utf-8') as f:
        content = f.read()
    
    old_is_mobile = '''  function isMobileStudioPerfMode() {
    try {
      if (typeof window.isDailyGenreMobilePerfMode === "function") return !!window.isDailyGenreMobilePerfMode();
      return Boolean((window.matchMedia && window.matchMedia('(max-width: 760px)').matches) || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || ''));
    } catch (_) { return false; }
  }'''
    
    new_is_mobile = '''  function isMobileStudioPerfMode() {
    try {
      return !!window.isDailyGenreMobilePerfMode?.();
    } catch (_) { return false; }
  }'''
    
    content = content.replace(old_is_mobile, new_is_mobile)
    with open(studio, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed studio-polish.js")

# Fix songs.js
songs = repo / "assets/js/songs.js"
if songs.exists():
    with open(songs, 'r', encoding='utf-8') as f:
        content = f.read()
    
    old_is_mobile = '''  function isMobilePerfMode() {
    try {
      if (typeof window.isDailyGenreMobilePerfMode === "function") return window.isDailyGenreMobilePerfMode();
      return Boolean(window.matchMedia && window.matchMedia("(max-width: 760px)").matches);
    } catch (_) { return false; }
  }'''
    
    new_is_mobile = '''  function isMobilePerfMode() {
    try {
      return !!window.isDailyGenreMobilePerfMode?.();
    } catch (_) { return false; }
  }'''
    
    content = content.replace(old_is_mobile, new_is_mobile)
    with open(songs, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed songs.js")

print("Done. Mobile detection standardized.")
