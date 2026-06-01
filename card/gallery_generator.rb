module GalleryGenerator
  class GalleryCollectionGenerator < Jekyll::Generator
    safe true
    priority :low

    def generate(site)
      gallery_dir = File.join(site.source, 'Gallery')
      
      return unless File.directory?(gallery_dir)

      # Get all subdirectories in Gallery folder
      Dir.glob(File.join(gallery_dir, '*')).each do |folder|
        next unless File.directory?(folder)
        
        folder_name = File.basename(folder)
        next if folder_name.start_with?('_') || folder_name.start_with?('.')
        next if folder_name == 'index.html'
        
        # Get all image files in the folder
        images = Dir.glob(File.join(folder, '*.{jpg,jpeg,png,gif,webp}'), File::FNM_CASEFOLD)
                     .map { |img| File.basename(img) }
                     .sort
        
        next if images.empty?

        # Create and register the gallery item
        gallery_item = GalleryItem.new(site, site.source, folder_name, images)
        site.collections['galleries'].docs << gallery_item
      end
    end
  end

  class GalleryItem < Jekyll::Document
    attr_reader :path

    def initialize(site, base, folder_name, images)
      @site = site
      @base = base
      @name = 'index.md'
      @folder_name = folder_name
      @images = images
      
      # Set up the document path
      @path = File.join(base, 'Gallery', folder_name, @name)
      @relative_path = File.join('Gallery', folder_name, @name)
      
      # Set up front matter data
      @data = {
        'layout' => 'gallery',
        'title' => folder_name.split('-').map(&:capitalize).join(' '),
        'folder' => folder_name,
        'images' => images,
        'permalink' => "/gallery/#{folder_name}/"
      }
      
      @content = ''
      @output = nil
    end

    def content
      ''
    end

    def output
      @output ||= ''
    end
  end
end
