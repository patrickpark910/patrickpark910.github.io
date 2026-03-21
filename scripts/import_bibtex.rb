#!/usr/bin/env ruby
# frozen_string_literal: true

# Imports a BibTeX file (e.g., exported from Google Scholar) into publications.js.
#
# Usage:
#   ruby scripts/import_bibtex.rb publications.bib
#
# Notes:
# - Google Scholar doesn't provide a perfect "export all" in one click for every profile.
#   Use "Export" (BibTeX) after selecting entries, then rerun this script.
# - This script only generates a minimal set of fields used by publications.js.

require "json"

ROOT = File.expand_path("..", __dir__)
PUBLICATIONS_JS = File.join(ROOT, "publications.js")

BEGIN_MARK = "// BEGIN AUTO-GENERATED PUBLICATIONS\n"
END_MARK = "// END AUTO-GENERATED PUBLICATIONS\n"

def abort_usage!
  warn "Usage: ruby scripts/import_bibtex.rb path/to/publications.bib"
  exit 2
end

def squish(str)
  str.to_s.gsub(/\s+/, " ").strip
end

def unbrace(value)
  v = value.to_s.strip
  # Remove surrounding braces/quotes (but keep internal braces).
  if (v.start_with?("{") && v.end_with?("}")) || (v.start_with?('"') && v.end_with?('"'))
    v = v[1..-2]
  end
  v
end

def normalize_title(title)
  squish(unbrace(title)).gsub(/\s+/, " ")
end

def normalize_authors(author_field)
  raw = squish(unbrace(author_field))
  return "" if raw.empty?

  # BibTeX "and" separated list.
  parts = raw.split(/\s+and\s+/i).map(&:strip).reject(&:empty?)
  parts.join(", ")
end

def venue_from(fields)
  %w[journal booktitle school institution organization publisher].each do |k|
    v = squish(unbrace(fields[k]))
    return v unless v.empty?
  end
  ""
end

def url_from(fields)
  url = squish(unbrace(fields["url"]))
  return url unless url.empty?

  doi = squish(unbrace(fields["doi"]))
  return "" if doi.empty?

  "https://doi.org/#{doi}"
end

def parse_entries(bibtex)
  # Very small BibTeX parser: good enough for Scholar exports.
  entries = []
  i = 0
  while (at = bibtex.index("@", i))
    # Find entry type and key, then body in braces.
    brace_open = bibtex.index("{", at)
    break unless brace_open

    header = bibtex[at...brace_open]
    type = header.sub("@", "").strip

    # Find matching closing brace for the entry.
    depth = 0
    j = brace_open
    while j < bibtex.length
      c = bibtex[j]
      depth += 1 if c == "{"
      depth -= 1 if c == "}"
      j += 1
      break if depth.zero?
    end
    body = bibtex[(brace_open + 1)...(j - 1)] || ""
    i = j

    # body begins with key until first comma, then fields.
    comma = body.index(",")
    next unless comma

    key = squish(body[0...comma])
    fields_src = body[(comma + 1)..] || ""

    fields = {}
    # Parse k = {v} / "v" / bare, allowing commas inside braces/quotes.
    k = nil
    v = +""
    state = :key
    depth2 = 0
    quote = false
    token = +""

    flush_pair = lambda do
      kk = squish(k)
      vv = token.strip
      if !kk.empty? && !vv.empty?
        fields[kk.downcase] = vv
      end
      k = nil
      token.clear
      state = :key
    end

    fields_src.each_char do |ch|
      if state == :key
        if ch == "="
          k = token.dup
          token.clear
          state = :value
        else
          token << ch
        end
        next
      end

      # state == :value
      if ch == '"' && depth2.zero?
        quote = !quote
        token << ch
        next
      end
      depth2 += 1 if ch == "{"
      depth2 -= 1 if ch == "}"

      if ch == "," && depth2 <= 0 && !quote
        flush_pair.call
        next
      end

      token << ch
    end
    # last pair
    flush_pair.call if state == :value

    entries << { "type" => type, "key" => key, "fields" => fields }
  end

  entries
end

def to_publication(entry)
  f = entry["fields"]
  year = squish(unbrace(f["year"])).to_i
  {
    id: entry["key"],
    title: normalize_title(f["title"]),
    authors: normalize_authors(f["author"]),
    venue: venue_from(f),
    year: year,
    topics: [],
    selected: false,
    links: begin
      links = {}
      doi = squish(unbrace(f["doi"]))
      links[:doi] = "https://doi.org/#{doi}" unless doi.empty?
      url = url_from(f)
      links[:project] = url unless url.empty?
      links
    end,
  }
end

def js_escape(str)
  # Use JSON to safely escape strings for JS.
  JSON.generate(str.to_s)
end

def render_js_array(publications)
  inner = publications.map do |p|
    links = p[:links]
    links_src =
      if links && !links.empty?
        pairs = links.map { |k, v| "#{k}: #{js_escape(v)}" }.join(", ")
        "{ #{pairs} }"
      else
        "{}"
      end

    topics_src = "[" + p[:topics].map { |t| js_escape(t) }.join(", ") + "]"

    <<~JS.strip
      {
        id: #{js_escape(p[:id])},
        title: #{js_escape(p[:title])},
        authors: #{js_escape(p[:authors])},
        venue: #{js_escape(p[:venue])},
        year: #{p[:year]},
        topics: #{topics_src},
        selected: #{p[:selected] ? "true" : "false"},
        links: #{links_src},
      }
    JS
  end

  "[\n" + inner.join(",\n") + "\n]"
end

def replace_generated_block(js, new_block)
  if js.include?(BEGIN_MARK) && js.include?(END_MARK)
    before = js.split(BEGIN_MARK, 2).first
    after = js.split(END_MARK, 2).last
    return before + BEGIN_MARK + new_block + "\n" + END_MARK + after
  end

  # Insert markers right after "const publications ="
  idx = js.index("const publications =")
  raise "Couldn't find `const publications =` in publications.js" unless idx

  line_end = js.index("\n", idx) || idx
  inject_at = line_end + 1
  js[0...inject_at] + BEGIN_MARK + new_block + "\n" + END_MARK + js[inject_at..]
end

input_path = ARGV[0]
abort_usage! unless input_path && File.file?(input_path)

unless File.file?(PUBLICATIONS_JS)
  warn "Missing publications.js at #{PUBLICATIONS_JS}"
  exit 1
end

bib = File.read(input_path, encoding: "UTF-8")
entries = parse_entries(bib)
pubs = entries.map { |e| to_publication(e) }.select { |p| p[:year] > 0 && !p[:title].empty? }
pubs.sort_by! { |p| [-p[:year], p[:title].downcase] }

js = File.read(PUBLICATIONS_JS, encoding: "UTF-8")

generated = "  const publications = " + render_js_array(pubs) + ";\n"
updated = replace_generated_block(js, generated)
File.write(PUBLICATIONS_JS, updated, mode: "w", encoding: "UTF-8")

puts "Imported #{pubs.length} publications into #{PUBLICATIONS_JS}"
