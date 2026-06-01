#!/usr/bin/env ruby

require 'fileutils'
require 'yaml'

# Configuration
IMAGES_DIR = File.join(__dir__, 'assets', 'images')
GALLERIES_DIR = File.join(__dir__, '_galleries')
GALLERIES_INDEX_DIR = File.join(__dir__, 'galleries')
GALLERY_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].freeze

# Create directories if they don't exist
FileUtils.mkdir_p(GALLERIES_DIR)
FileUtils.mkdir_p(GALLERIES_INDEX_DIR)

# Find all image folders
gallery_folders = Dir.glob(File.join(IMAGES_DIR, '*')).select { |f| File.directory?(f) }

if gallery_folders.empty?
  puts "No image folders found in #{IMAGES_DIR}"
  puts "Create folders with images in: assets/images/gallery-name/"
  exit 0
end

puts "Found #{gallery_folders.length} gallery folder(s). Generating metadata..."

gallery_folders.each do |folder_path|
  folder_name = File.basename(folder_path)
  
  # Get all images in folder
  images = Dir.glob(File.join(folder_path, '*')).select do |f|
    File.file?(f) && GALLERY_IMAGE_EXTS.include?(File.extname(f).downcase)
  end.sort
  
  next if images.empty?
  
  # Create friendly name from folder name
  friendly_name = folder_name
    .gsub(/[-_]/, ' ')
    .split
    .map(&:capitalize)
    .join(' ')
  
  # Create relative paths for use in Jekyll
  image_paths = images.map do |img|
    "/assets/images/#{folder_name}/#{File.basename(img)}"
  end
  
  # Generate gallery metadata file
  gallery_slug = folder_name.downcase.gsub(/[^a-z0-9]+/, '-').gsub(/^-|-$/, '')
  gallery_file = File.join(GALLERIES_DIR, "#{gallery_slug}.md")
  
  metadata = {
    'layout' => 'gallery',
    'title' => friendly_name,
    'gallery_slug' => gallery_slug,
    'folder_name' => folder_name,
    'images' => image_paths,
    'image_count' => image_paths.length,
    'thumbnail' => image_paths.first
  }
  
  content = metadata.to_yaml + "\n---\n"
  
  File.write(gallery_file, content)
  puts "✓ Generated: #{gallery_file} (#{images.length} images)"
end

puts "\nGalleries updated successfully!"
puts "Run 'jekyll serve' to preview"

# Create or update the galleries landing page index
galleries_index_file = File.join(GALLERIES_INDEX_DIR, 'index.md')
galleries_index_content = %{---
layout: default
title: Galleries
---

<style>
    .galleries-container {
        max-width: 1200px;
        margin: 3rem auto;
        padding: 0 1rem;
    }
    
    .galleries-header {
        text-align: center;
        margin-bottom: 3rem;
    }
    
    .galleries-header h1 {
        font-size: 2.5rem;
        margin: 0 0 1rem 0;
    }
    
    .galleries-header p {
        color: #666;
        font-size: 1.1rem;
    }
    
    .galleries-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 2rem;
    }
    
    .gallery-card {
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        text-decoration: none;
        color: inherit;
        display: block;
    }
    
    .gallery-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }
    
    .gallery-card-image {
        width: 100%;
        height: 300px;
        object-fit: cover;
        display: block;
    }
    
    .gallery-card-content {
        padding: 1.5rem;
        background: white;
    }
    
    .gallery-card-title {
        font-size: 1.3rem;
        font-weight: 600;
        margin: 0 0 0.5rem 0;
    }
    
    .gallery-card-count {
        color: #888;
        font-size: 0.95rem;
        margin: 0;
    }
    
    .no-galleries {
        text-align: center;
        padding: 3rem 1rem;
        color: #666;
    }
</style>

<div class="galleries-container">
    <div class="galleries-header">
        <h1>Image Galleries</h1>
        <p>Explore all photo collections</p>
    </div>
    
    {% assign galleries = site.galleries | sort: 'title' %}
    
    {% if galleries.size > 0 %}
        <div class="galleries-grid">
            {% for gallery in galleries %}
                <a href="{{ gallery.url }}" class="gallery-card">
                    {% if gallery.thumbnail %}
                        <img src="{{ gallery.thumbnail }}" alt="{{ gallery.title }}" class="gallery-card-image">
                    {% endif %}
                    <div class="gallery-card-content">
                        <h3 class="gallery-card-title">{{ gallery.title }}</h3>
                        <p class="gallery-card-count">{{ gallery.image_count }} images</p>
                    </div>
                </a>
            {% endfor %}
        </div>
    {% else %}
        <div class="no-galleries">
            <p>No galleries yet. Add image folders to <code>assets/images/</code> and run the gallery generator.</p>
        </div>
    {% endif %}
</div>}

File.write(galleries_index_file, galleries_index_content)
puts "✓ Created galleries landing page: #{galleries_index_file}"
