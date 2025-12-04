"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Pencil,
  Trash2,
  Save,
  X,
  ImageIcon,
} from "lucide-react";
import {
  fetchImageWithVariants,
  updateVariant,
  deleteVariant,
  type ImageWithVariants,
  type ImageVariant,
} from "@/app/api/actions/creator";

interface ImageDetailModalProps {
  imageId: string | null;
  creatorId: string;
  isOpen: boolean;
  onClose: () => void;
  onVariantUpdated?: () => void;
}

export function ImageDetailModal({
  imageId,
  creatorId,
  isOpen,
  onClose,
  onVariantUpdated,
}: ImageDetailModalProps) {
  const [image, setImage] = useState<ImageWithVariants | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    description: string;
    price: string;
  }>({ name: "", description: "", price: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ImageVariant | null>(null);

  useEffect(() => {
    async function loadImage() {
      if (!imageId || !isOpen) return;

      setIsLoading(true);
      try {
        const data = await fetchImageWithVariants(imageId, creatorId);
        setImage(data);
        setSelectedVariant(null);
      } catch (error) {
        console.error("Failed to load image:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadImage();
  }, [imageId, creatorId, isOpen]);

  const handleEditVariant = (variant: ImageVariant) => {
    setEditingVariantId(variant.id);
    setEditForm({
      name: variant.name,
      description: variant.description || "",
      price: variant.price,
    });
  };

  const handleCancelEdit = () => {
    setEditingVariantId(null);
    setEditForm({ name: "", description: "", price: "" });
  };

  const handleSaveVariant = async (variantId: string) => {
    setIsSaving(true);
    try {
      const updated = await updateVariant(variantId, creatorId, {
        name: editForm.name,
        description: editForm.description || undefined,
        price: parseFloat(editForm.price),
      });

      if (updated && image) {
        setImage({
          ...image,
          variants: image.variants.map((v) =>
            v.id === variantId ? { ...v, ...updated } : v
          ),
        });
        setEditingVariantId(null);
        onVariantUpdated?.();
      }
    } catch (error) {
      console.error("Failed to update variant:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm("Are you sure you want to delete this variant?")) return;

    try {
      const success = await deleteVariant(variantId, creatorId);
      if (success && image) {
        setImage({
          ...image,
          variants: image.variants.filter((v) => v.id !== variantId),
        });
        if (selectedVariant?.id === variantId) {
          setSelectedVariant(null);
        }
        onVariantUpdated?.();
      }
    } catch (error) {
      console.error("Failed to delete variant:", error);
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
    }).format(parseFloat(price));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Image Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : image ? (
          <div className="space-y-6">
            {/* Main Image Section */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Image Preview */}
              <div className="space-y-4">
                <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
                  <img
                    src={selectedVariant?.url || image.url}
                    alt={image.description || "Image"}
                    className="size-full object-contain"
                  />
                </div>
                {selectedVariant && (
                  <p className="text-center text-sm text-muted-foreground">
                    Viewing: {selectedVariant.name}
                  </p>
                )}
              </div>

              {/* Image Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Event</h3>
                  <p className="text-lg">
                    {image.event?.name || "Uncategorized"}
                  </p>
                  {image.event && (
                    <p className="text-sm text-muted-foreground">
                      {formatDate(image.event.date)} - {image.event.location}
                    </p>
                  )}
                </div>

                {image.description && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Description</h3>
                    <p>{image.description}</p>
                  </div>
                )}

                {image.bibNumber && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Bib Number</h3>
                    <p className="font-mono text-lg">{image.bibNumber}</p>
                  </div>
                )}

                {image.plateNumber && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Plate Number</h3>
                    <p className="font-mono text-lg">{image.plateNumber}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Uploaded</h3>
                  <p>{formatDate(image.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Variants Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Variants ({image.variants.length})
                </h3>
                {selectedVariant && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedVariant(null)}
                  >
                    View Original
                  </Button>
                )}
              </div>

              {image.variants.length > 0 ? (
                <div className="space-y-4">
                  {image.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${
                        selectedVariant?.id === variant.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      {/* Variant Thumbnail */}
                      <div
                        className="size-20 shrink-0 cursor-pointer overflow-hidden rounded-md border bg-muted"
                        onClick={() => setSelectedVariant(variant)}
                      >
                        {variant.url ? (
                          <img
                            src={variant.url}
                            alt={variant.name}
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center">
                            <ImageIcon className="size-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Variant Details */}
                      <div className="flex-1 min-w-0">
                        {editingVariantId === variant.id ? (
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="name">Name</Label>
                              <Input
                                id="name"
                                value={editForm.name}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, name: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="description">Description</Label>
                              <Input
                                id="description"
                                value={editForm.description}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    description: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="price">Price (MYR)</Label>
                              <Input
                                id="price"
                                type="number"
                                step="0.01"
                                value={editForm.price}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, price: e.target.value })
                                }
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveVariant(variant.id)}
                                disabled={isSaving}
                              >
                                {isSaving ? (
                                  <Loader2 className="mr-2 size-4 animate-spin" />
                                ) : (
                                  <Save className="mr-2 size-4" />
                                )}
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                              >
                                <X className="mr-2 size-4" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium">{variant.name}</h4>
                                {variant.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {variant.description}
                                  </p>
                                )}
                              </div>
                              <p className="font-semibold text-primary">
                                {formatPrice(variant.price)}
                              </p>
                            </div>
                            <div className="mt-2 flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditVariant(variant)}
                              >
                                <Pencil className="mr-2 size-3" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteVariant(variant.id)}
                              >
                                <Trash2 className="mr-2 size-3" />
                                Delete
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border-2 border-dashed p-8 text-center">
                  <ImageIcon className="mx-auto size-12 text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">
                    No variants for this image
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Upload variants when creating new content
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Image not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
