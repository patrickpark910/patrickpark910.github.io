#!/usr/bin/env ruby
# frozen_string_literal: true

# Generate publication thumbnails from local PDFs/images.
#
# Typical usage:
# 1) Put PDFs (or images) in: assets/papers/
#    - Name each file with the publication id (BibTeX key), e.g. `na2025bubble.pdf`
# 2) Run:
#    ruby scripts/make_pub_thumbs.rb
#
# Output:
#   assets/publications/<id>.jpg
#
# Notes:
# - We generate from the first page of the PDF (quick + reliable without heavy PDF parsing).
# - Thumbnails are resized; exact cropping is handled by CSS `object-fit: cover` on the site.

ROOT = File.expand_path("..", __dir__)
PAPERS_DIR = File.join(ROOT, "assets", "papers")
OUT_DIR = File.join(ROOT, "assets", "publications")
TMP_DIR = File.join(ROOT, "assets", ".tmp_thumbs")

def sh(*cmd)
  ok = system(*cmd)
  raise "Command failed: #{cmd.join(' ')}" unless ok
end

def ensure_tool!(name)
  path = `command -v #{name} 2>/dev/null`.strip
  raise "Missing required tool: #{name}" if path.empty?
  path
end

def ext(path)
  File.extname(path).downcase
end

def base(path)
  File.basename(path, File.extname(path))
end

def make_dirs!
  [PAPERS_DIR, OUT_DIR, TMP_DIR].each { |d| Dir.mkdir(d) unless Dir.exist?(d) }
end

def clean_tmp!
  return unless Dir.exist?(TMP_DIR)
  Dir.glob(File.join(TMP_DIR, "*")).each { |f| File.delete(f) if File.file?(f) }
end

def resize_to_jpg(src_path, out_path)
  # Use sips to convert + resize in one go.
  # -Z keeps aspect ratio with max dimension.
  sh("sips", "-s", "format", "jpeg", "-Z", "900", src_path, "--out", out_path)
end

def ql_thumb_pdf(pdf_path, out_png_path)
  # qlmanage writes a PNG thumbnail into the output directory; we then rename it.
  out_dir = File.dirname(out_png_path)
  name = File.basename(out_png_path)
  clean_tmp!
  sh("qlmanage", "-t", "-s", "900", "-o", out_dir, pdf_path)

  # qlmanage outputs: <pdfname>.png (and sometimes appends .png to the full name)
  candidates = Dir.glob(File.join(out_dir, "#{File.basename(pdf_path)}*.png")) +
               Dir.glob(File.join(out_dir, "#{base(pdf_path)}*.png"))
  png = candidates.find { |p| File.file?(p) }
  raise "qlmanage didn't produce a PNG for #{pdf_path}" unless png

  File.rename(png, File.join(out_dir, name))
end

begin
  ensure_tool!("sips")
  ensure_tool!("qlmanage")
  make_dirs!

  inputs = Dir.glob(File.join(PAPERS_DIR, "*")).select { |p| File.file?(p) }
  if inputs.empty?
    puts "No inputs found in #{PAPERS_DIR}"
    puts "Add PDFs/images named like `<pubid>.pdf` then re-run this script."
    exit 0
  end

  generated = 0
  inputs.each do |path|
    id = base(path)
    out_jpg = File.join(OUT_DIR, "#{id}.jpg")
    tmp_png = File.join(TMP_DIR, "#{id}.png")

    case ext(path)
    when ".pdf"
      ql_thumb_pdf(path, tmp_png)
      resize_to_jpg(tmp_png, out_jpg)
      File.delete(tmp_png) if File.file?(tmp_png)
      generated += 1
      puts "OK  #{File.basename(out_jpg)}  (from #{File.basename(path)})"
    when ".png", ".jpg", ".jpeg", ".webp"
      resize_to_jpg(path, out_jpg)
      generated += 1
      puts "OK  #{File.basename(out_jpg)}  (from #{File.basename(path)})"
    else
      puts "SKIP #{File.basename(path)} (unsupported: #{ext(path)})"
    end
  end

  puts "Generated #{generated} thumbnails into #{OUT_DIR}"
ensure
  # Keep tmp dir but empty it (helps debugging if needed).
  clean_tmp!
end

