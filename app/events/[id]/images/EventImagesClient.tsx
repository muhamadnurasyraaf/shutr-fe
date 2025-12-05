"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import {
  Calendar,
  MapPin,
  Images,
  User,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  ShoppingCart,
  Upload,
  Search,
  Loader2,
  Check,
} from "lucide-react";
import type {
  EventDetails,
  EventImage,
  EventImagesResponse,
  ImageVariant,
} from "@/app/api/actions/event";
import { useClientAPI } from "@/lib/client-api";

interface SimilarImage extends EventImage {
  similarity: number;
}

interface EventImagesClientProps {
  initialData: EventImagesResponse;
}

export default function EventImagesClient({
  initialData,
}: EventImagesClientProps) {
  const { event, images, pagination } = initialData;
  const api = useClientAPI();

  const [selectedImage, setSelectedImage] = useState<EventImage | null>(null);
  const [currentPage, setCurrentPage] = useState(pagination.page);

  // Similar image search state
  const [isDragging, setIsDragging] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [similarImages, setSimilarImages] = useState<SimilarImage[] | null>(
    null,
  );
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);

  // Variant modal state
  const [variantModalImage, setVariantModalImage] = useState<EventImage | null>(
    null,
  );
  const [selectedVariant, setSelectedVariant] = useState<ImageVariant | null>(
    null,
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-MY", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
    }).format(price);
  };

  const openLightbox = (image: EventImage) => {
    setSelectedImage(image);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = "unset";
  };

  const openVariantModal = (image: EventImage, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setVariantModalImage(image);
    setSelectedVariant(image.variants.length > 0 ? image.variants[0] : null);
    document.body.style.overflow = "hidden";
  };

  const closeVariantModal = () => {
    setVariantModalImage(null);
    setSelectedVariant(null);
    document.body.style.overflow = "unset";
  };

  const handleAddToCart = () => {
    if (!variantModalImage || !selectedVariant) return;
    // TODO: Implement actual cart functionality
    console.log("Adding to cart:", {
      imageId: variantModalImage.id,
      variantId: selectedVariant.id,
      variantName: selectedVariant.name,
      price: selectedVariant.price,
    });
    alert(
      `Added "${selectedVariant.name}" to cart for ${formatPrice(selectedVariant.price)}`,
    );
    closeVariantModal();
  };

  const navigateImage = (direction: "prev" | "next") => {
    if (!selectedImage) return;
    const displayImages = similarImages || images;
    const currentIndex = displayImages.findIndex(
      (img) => img.id === selectedImage.id,
    );
    if (direction === "prev" && currentIndex > 0) {
      setSelectedImage(displayImages[currentIndex - 1]);
    } else if (
      direction === "next" &&
      currentIndex < displayImages.length - 1
    ) {
      setSelectedImage(displayImages[currentIndex + 1]);
    }
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleImageUpload(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        await handleImageUpload(files[0]);
      }
    },
    [],
  );

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Search for similar images
    setIsSearching(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post<{ images: SimilarImage[] }>(
        `/event/${event.id}/search-similar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setSimilarImages(response.data.images);
    } catch (error) {
      console.error("Failed to search for similar images:", error);
      alert("Failed to search for similar images. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSimilarImages(null);
    setUploadedPreview(null);
  };

  // Determine which images to display
  const displayImages = similarImages || images;

  return (
    <>
      <Header variant="solid" textVariant="dark" />

      <div className="min-h-screen bg-slate-100">
        {/* Event Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
            {/* Breadcrumb */}
            <nav className="mb-4">
              <ol className="flex items-center gap-2 text-sm text-gray-500">
                <li>
                  <Link href="/" className="hover:text-cyan-600">
                    Home
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link href="/events" className="hover:text-cyan-600">
                    Events
                  </Link>
                </li>
                <li>/</li>
                <li className="text-gray-900 font-medium">{event.name}</li>
              </ol>
            </nav>

            {/* Event Info */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {event.name}
                </h1>
                {event.description && (
                  <p className="text-gray-600 mb-4 max-w-2xl">
                    {event.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-cyan-500" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-cyan-500" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Images className="w-4 h-4 text-cyan-500" />
                    <span>{event.imageCount} photos</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-cyan-500" />
                    <span>
                      by {event.creator.displayName || event.creator.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Event Thumbnail */}
              {event.thumbnailUrl && (
                <div className="w-full md:w-48 h-32 relative rounded-lg overflow-hidden shadow-md flex-shrink-0">
                  <Image
                    src={event.thumbnailUrl}
                    alt={event.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Find Similar Photos Section */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                <Search className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Find Your Photos
                </h2>
                <p className="text-sm text-gray-500">
                  Upload a photo of yourself to find similar images from this
                  event
                </p>
              </div>
            </div>

            {/* Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? "border-cyan-500 bg-cyan-50"
                  : "border-gray-300 hover:border-cyan-400 hover:bg-gray-50"
              }`}
            >
              {isSearching ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
                  <p className="text-gray-600">
                    Searching for similar photos...
                  </p>
                </div>
              ) : uploadedPreview && similarImages ? (
                <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                      <Image
                        src={uploadedPreview}
                        alt="Uploaded photo"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">
                        Found {similarImages.length} similar photos
                      </p>
                      <button
                        onClick={clearSearch}
                        className="text-sm text-cyan-600 hover:text-cyan-700"
                      >
                        Clear search
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">
                    Drag and drop your photo here, or{" "}
                    <label className="text-cyan-600 hover:text-cyan-700 cursor-pointer font-medium">
                      browse
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-xs text-gray-400">
                    Supports JPG, PNG up to 10MB
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Images Grid */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Results Header */}
          {similarImages && (
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Similar Photos ({similarImages.length})
              </h3>
              <button
                onClick={clearSearch}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Show all photos
              </button>
            </div>
          )}

          {displayImages.length === 0 ? (
            <div className="text-center py-16">
              <Images className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {similarImages ? "No similar photos found" : "No photos yet"}
              </h3>
              <p className="text-gray-500">
                {similarImages
                  ? "Try uploading a different photo"
                  : "Photos from this event will appear here once uploaded."}
              </p>
            </div>
          ) : (
            <>
              {/* Masonry-style Grid */}
              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {displayImages.map((image) => (
                  <div
                    key={image.id}
                    className="break-inside-avoid group cursor-pointer"
                    onClick={() => openLightbox(image)}
                  >
                    <div className="relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                      <Image
                        src={image.url}
                        alt={image.description || "Event photo"}
                        width={400}
                        height={300}
                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Similarity Badge */}
                      {"similarity" in image && (
                        <div className="absolute top-2 right-2 bg-cyan-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                          {Math.round((image as SimilarImage).similarity * 100)}
                          % match
                        </div>
                      )}
                      {/* Price Badge */}
                      {image.variants.length > 0 && (
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-full">
                          From {formatPrice(image.variants[0].price)}
                        </div>
                      )}
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
                        <div className="w-full p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {image.creator.image ? (
                                <Image
                                  src={image.creator.image}
                                  alt={
                                    image.creator.displayName ||
                                    image.creator.name ||
                                    "Photographer"
                                  }
                                  width={24}
                                  height={24}
                                  className="rounded-full"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-cyan-400 flex items-center justify-center">
                                  <User className="w-3 h-3 text-white" />
                                </div>
                              )}
                              <span className="text-white text-xs font-medium">
                                {image.creator.displayName ||
                                  image.creator.name}
                              </span>
                            </div>
                            <button
                              className="p-1.5 bg-cyan-400 rounded-full hover:bg-cyan-500 transition-colors"
                              onClick={(e) => openVariantModal(image, e)}
                            >
                              <ShoppingCart className="w-3 h-3 text-black" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination - only show when not in search mode */}
              {!similarImages && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    disabled={!pagination.hasPrev}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      pagination.hasPrev
                        ? "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    disabled={!pagination.hasNext}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      pagination.hasNext
                        ? "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Navigation Arrows */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateImage("prev");
            }}
            className="absolute left-4 p-2 text-white/80 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateImage("next");
            }}
            className="absolute right-4 p-2 text-white/80 hover:text-white transition-colors"
          >
            <ChevronRight className="w-10 h-10" />
          </button>

          {/* Image Container */}
          <div
            className="relative max-w-5xl max-h-[85vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage.url}
              alt={selectedImage.description || "Event photo"}
              width={1200}
              height={800}
              className="max-h-[85vh] w-auto object-contain rounded-lg"
            />

            {/* Image Info Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedImage.creator.image ? (
                    <Image
                      src={selectedImage.creator.image}
                      alt={
                        selectedImage.creator.displayName ||
                        selectedImage.creator.name ||
                        "Photographer"
                      }
                      width={36}
                      height={36}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-cyan-400 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">
                      {selectedImage.creator.displayName ||
                        selectedImage.creator.name}
                    </p>
                    {selectedImage.description && (
                      <p className="text-white/70 text-sm">
                        {selectedImage.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Download</span>
                  </button>
                  <button
                    onClick={() => openVariantModal(selectedImage)}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-400 hover:bg-cyan-500 text-black rounded-lg transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="text-sm font-medium">Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Variant Selection Modal */}
      {variantModalImage && (
        <div
          className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4"
          onClick={closeVariantModal}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Select Photo Variant
              </h3>
              <button
                onClick={closeVariantModal}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Image Preview */}
                <div className="md:w-1/2">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={selectedVariant?.url || variantModalImage.url}
                      alt={variantModalImage.description || "Photo"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {selectedVariant
                      ? `Preview: ${selectedVariant.name}`
                      : "Original image"}
                  </p>
                </div>

                {/* Variant Options */}
                <div className="md:w-1/2">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Available Options
                  </h4>

                  {variantModalImage.variants.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">
                        No variants available for this image.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {variantModalImage.variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                            selectedVariant?.id === variant.id
                              ? "border-cyan-400 bg-cyan-50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">
                                  {variant.name}
                                </span>
                                {selectedVariant?.id === variant.id && (
                                  <Check className="w-4 h-4 text-cyan-500" />
                                )}
                              </div>
                              {variant.description && (
                                <p className="text-sm text-gray-500 mt-1">
                                  {variant.description}
                                </p>
                              )}
                            </div>
                            <span className="text-lg font-semibold text-gray-900 ml-4">
                              {formatPrice(variant.price)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  {selectedVariant && (
                    <p className="text-sm text-gray-600">
                      Total:{" "}
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(selectedVariant.price)}
                      </span>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={closeVariantModal}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddToCart}
                    disabled={!selectedVariant}
                    className="flex items-center gap-2 px-6 py-2 bg-cyan-400 hover:bg-cyan-500 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
