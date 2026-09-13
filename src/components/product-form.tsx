"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { parsePriceInput, type Product, type ProductMediaItem } from "@/lib/types";
import { VIDEO_ACCEPT } from "@/lib/upload";

type ProductFormProps = {
  product?: Product;
};

export function ProductForm({ product: initialProduct }: ProductFormProps) {
  const isEdit = Boolean(initialProduct);
  const router = useRouter();
  const [product, setProduct] = useState(initialProduct);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null);

  async function deleteMedia(mediaId: string, confirmMessage: string) {
    if (!product) return;
    if (!window.confirm(confirmMessage)) return;

    setError(null);
    setSuccess(null);
    setDeletingMediaId(mediaId);

    try {
      const response = await fetch(
        `/api/products/${product.id}/media/${mediaId}`,
        { method: "DELETE" }
      );

      const data = (await response.json()) as Product & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "削除に失敗しました");
      }

      setProduct(data);
      setSuccess("削除しました");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "削除に失敗しました"
      );
    } finally {
      setDeletingMediaId(null);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const priceRaw = String(formData.get("price") ?? "");
    const listImage = formData.get("listImage");
    const detailImages = formData.getAll("detailImages");

    const price = parsePriceInput(priceRaw);
    if (!title) {
      setError("商品名を入力してください");
      setIsSubmitting(false);
      return;
    }
    if (!description) {
      setError("商品説明を入力してください");
      setIsSubmitting(false);
      return;
    }
    if (price === null) {
      setError("価格は1円以上の整数で入力してください");
      setIsSubmitting(false);
      return;
    }

    const hasNewListImage = listImage instanceof File && listImage.size > 0;
    const newDetailCount = detailImages.filter(
      (file) => file instanceof File && file.size > 0
    ).length;

    if (!isEdit && !hasNewListImage) {
      setError("一覧用画像を選択してください");
      setIsSubmitting(false);
      return;
    }
    if (isEdit && !product?.listImageUrl && !hasNewListImage) {
      setError("一覧用画像を選択してください");
      setIsSubmitting(false);
      return;
    }
    if (!isEdit && newDetailCount === 0) {
      setError("詳細用画像を1件以上選択してください");
      setIsSubmitting(false);
      return;
    }
    if (
      isEdit &&
      (product?.detailImageMedia?.length ?? 0) + newDetailCount === 0
    ) {
      setError("詳細用画像を1件以上残すか、追加してください");
      setIsSubmitting(false);
      return;
    }

    formData.set("price", String(price));

    try {
      const response = await fetch(
        isEdit ? `/api/products/${product!.id}` : "/api/products",
        {
          method: isEdit ? "PATCH" : "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? (isEdit ? "更新に失敗しました" : "出品に失敗しました"));
      }

      router.push("/seller/products");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : isEdit
            ? "更新に失敗しました"
            : "出品に失敗しました"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      ) : null}

      <Field
        label="商品名"
        name="title"
        required
        defaultValue={product?.title}
        placeholder="例: ワイヤレスイヤホン"
      />
      <Field
        label="価格（円）"
        name="price"
        required
        type="number"
        min={1}
        defaultValue={product?.price}
        placeholder="4980"
      />

      {isEdit ? (
        <>
          <FileField
            key={`list-${product?.listImageMediaId ?? "none"}`}
            label="一覧用画像"
            name="listImage"
            accept="image/jpeg,image/png,image/webp,image/gif"
            hint="変更する場合のみ選択してください（最大5MB）"
            initialPreviewUrl={product?.listImageUrl || null}
            previewAlt="一覧用画像プレビュー"
            deleteLabel="一覧用画像を削除する"
            onDelete={
              product?.listImageMediaId
                ? () =>
                    deleteMedia(
                      product.listImageMediaId!,
                      "一覧用画像を削除しますか？"
                    )
                : undefined
            }
            isDeleting={deletingMediaId === product?.listImageMediaId}
          />
          <DetailImagesEditField
            key={
              product?.detailImageMedia?.map((item) => item.id).join("-") ?? "none"
            }
            existingImages={product?.detailImageMedia ?? []}
            deletingMediaId={deletingMediaId}
            onRemoveExisting={(mediaId) =>
              deleteMedia(mediaId, "この詳細用画像を削除しますか？")
            }
          />
        </>
      ) : (
        <>
          <FileField
            label="一覧用画像"
            name="listImage"
            required
            accept="image/jpeg,image/png,image/webp,image/gif"
            hint="商品一覧・トップ画面に表示されるメイン画像（最大5MB）"
            previewAlt="一覧用画像プレビュー"
          />
          <FileField
            label="詳細用画像（複数選択可）"
            name="detailImages"
            required
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            hint="商品詳細画面のギャラリーに表示されます（1件以上、各最大5MB）"
            previewAlt="詳細用画像プレビュー"
          />
        </>
      )}

      <FileField
        key={`video-${product?.videoMediaId ?? "none"}`}
        label="商品動画（任意）"
        name="video"
        accept={VIDEO_ACCEPT}
        hint={
          isEdit
            ? "MP4 / WebM / MOV 形式（最大20MB）。変更する場合のみ選択してください"
            : "MP4 / WebM / MOV 形式（最大20MB）"
        }
        initialPreviewUrl={product?.videoUrl ?? null}
        previewAlt="商品動画プレビュー"
        previewIsVideo
        deleteLabel="商品動画を削除する"
        onDelete={
          product?.videoMediaId
            ? () =>
                deleteMedia(product.videoMediaId!, "商品動画を削除しますか？")
            : undefined
        }
        isDeleting={deletingMediaId === product?.videoMediaId}
      />

      <TextAreaField
        label="商品詳細説明"
        name="description"
        required
        rows={8}
        defaultValue={product?.description}
        placeholder="商品の特徴、仕様、使い方などを入力してください"
      />

      <button
        type="submit"
        disabled={isSubmitting || deletingMediaId !== null}
        className="amazon-btn-primary px-6 py-3 text-sm font-medium text-[#0f1111] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting
          ? isEdit
            ? "保存中..."
            : "出品中..."
          : isEdit
            ? "変更を保存"
            : "商品を出品する"}
      </button>
    </form>
  );
}

function DetailImagesEditField({
  existingImages,
  deletingMediaId,
  onRemoveExisting,
}: {
  existingImages: ProductMediaItem[];
  deletingMediaId: string | null;
  onRemoveExisting: (mediaId: string) => void;
}) {
  const objectUrlsRef = useRef<string[]>([]);
  const [newPreviewUrls, setNewPreviewUrls] = useState<string[]>([]);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];

    const files = event.target.files;
    if (!files || files.length === 0) {
      setNewPreviewUrls([]);
      setSelectedFileName(null);
      return;
    }

    const urls = Array.from(files).map((file) => {
      const url = URL.createObjectURL(file);
      objectUrlsRef.current.push(url);
      return url;
    });
    setNewPreviewUrls(urls);
    setSelectedFileName(
      files.length === 1 ? files[0].name : `${files.length}件のファイル`
    );
  }

  return (
    <div className="block space-y-2">
      <span className="text-sm font-medium text-slate-800">
        詳細用画像（複数選択可）
      </span>

      {existingImages.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-[#565959]">登録済みの画像</p>
          <div className="flex flex-wrap gap-3">
            {existingImages.map((item, index) => (
              <div key={item.id} className="relative">
                <div className="h-24 w-24 overflow-hidden rounded border border-[#ddd] bg-white p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={`詳細用画像 ${index + 1}`}
                    className="h-full w-full object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveExisting(item.id)}
                  disabled={deletingMediaId !== null}
                  className="mt-1 w-full rounded border border-[#b12704] px-2 py-1 text-xs text-[#b12704] hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingMediaId === item.id ? "削除中..." : "削除"}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-[#565959]">登録済みの詳細用画像はありません</p>
      )}

      {newPreviewUrls.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-[#565959]">追加する画像</p>
          <div className="flex flex-wrap gap-2">
            {newPreviewUrls.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="h-20 w-20 overflow-hidden rounded border border-[#ddd] bg-white p-1"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`追加画像 ${index + 1}`}
                  className="h-full w-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <input
        type="file"
        name="detailImages"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={handleFileChange}
        className="amazon-input w-full px-4 py-3 text-sm file:mr-3 file:rounded file:border-0 file:bg-[#f0f2f2] file:px-3 file:py-1 file:text-sm"
      />
      {selectedFileName ? (
        <span className="text-xs text-[#007185]">追加予定: {selectedFileName}</span>
      ) : null}
      <span className="text-xs text-slate-500">
        不要な画像は「削除」ボタンで即座に削除できます。新しい画像はファイル選択で追加できます（各最大5MB）
      </span>
    </div>
  );
}

function Field({
  label,
  name,
  required,
  type = "text",
  placeholder,
  hint,
  min,
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  hint?: string;
  min?: number;
  defaultValue?: string | number;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        min={min}
        defaultValue={defaultValue}
        className="amazon-input w-full px-4 py-3 text-sm"
      />
      {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}

function FileField({
  label,
  name,
  required,
  accept,
  multiple,
  hint,
  initialPreviewUrl,
  initialPreviewUrls,
  previewAlt,
  previewIsVideo,
  onFileSelected,
  deleteLabel,
  onDelete,
  isDeleting = false,
}: {
  label: string;
  name: string;
  required?: boolean;
  accept: string;
  multiple?: boolean;
  hint?: string;
  initialPreviewUrl?: string | null;
  initialPreviewUrls?: string[];
  previewAlt?: string;
  previewIsVideo?: boolean;
  onFileSelected?: () => void;
  deleteLabel?: string;
  onDelete?: () => void;
  isDeleting?: boolean;
}) {
  const objectUrlsRef = useRef<string[]>([]);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [localPreviewUrls, setLocalPreviewUrls] = useState<string[]>([]);
  const [hasSelectedFile, setHasSelectedFile] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const previewUrl = hasSelectedFile ? localPreviewUrl : (initialPreviewUrl ?? null);
  const previewUrls = hasSelectedFile ? localPreviewUrls : (initialPreviewUrls ?? []);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function clearObjectUrls() {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;

    clearObjectUrls();

    if (!files || files.length === 0) {
      setHasSelectedFile(false);
      setSelectedFileName(null);
      setLocalPreviewUrl(null);
      setLocalPreviewUrls([]);
      return;
    }

    onFileSelected?.();
    setHasSelectedFile(true);

    if (multiple) {
      const urls = Array.from(files).map((file) => {
        const url = URL.createObjectURL(file);
        objectUrlsRef.current.push(url);
        return url;
      });
      setSelectedFileName(
        files.length === 1 ? files[0].name : `${files.length}件のファイル`
      );
      setLocalPreviewUrls(urls);
      setLocalPreviewUrl(null);
      return;
    }

    const file = files[0];
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.push(url);
    setSelectedFileName(file.name);
    setLocalPreviewUrl(url);
    setLocalPreviewUrls([]);
  }

  const showSinglePreview = previewUrl;
  const showMultiplePreview = previewUrls.length > 0;

  return (
    <div className="block space-y-2">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      {showSinglePreview ? (
        <div className="overflow-hidden rounded border border-[#ddd] bg-white p-2">
          {previewIsVideo ? (
            <video
              key={previewUrl}
              src={previewUrl}
              controls
              className="max-h-48 w-full rounded bg-black"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={previewUrl}
              src={previewUrl}
              alt={previewAlt ?? "プレビュー"}
              className="max-h-48 w-full object-contain"
            />
          )}
        </div>
      ) : null}
      {showMultiplePreview ? (
        <div className="flex flex-wrap gap-2">
          {previewUrls.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="h-20 w-20 overflow-hidden rounded border border-[#ddd] bg-white p-1"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`${previewAlt ?? "プレビュー"} ${index + 1}`}
                className="h-full w-full object-contain"
              />
            </div>
          ))}
        </div>
      ) : null}
      <input
        type="file"
        name={name}
        required={required}
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="amazon-input w-full px-4 py-3 text-sm file:mr-3 file:rounded file:border-0 file:bg-[#f0f2f2] file:px-3 file:py-1 file:text-sm"
      />
      {selectedFileName ? (
        <span className="text-xs text-[#007185]">選択中: {selectedFileName}</span>
      ) : null}
      {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
      {hasSelectedFile ? (
        <span className="text-xs text-[#007185]">選択したファイルをプレビュー表示しています</span>
      ) : null}
      {onDelete && deleteLabel ? (
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="rounded border border-[#b12704] px-3 py-1.5 text-xs text-[#b12704] hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting ? "削除中..." : deleteLabel}
        </button>
      ) : null}
    </div>
  );
}

function TextAreaField({
  label,
  name,
  required,
  rows,
  placeholder,
  hint,
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  rows: number;
  placeholder?: string;
  hint?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      <textarea
        name={name}
        required={required}
        rows={rows}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="amazon-input w-full px-4 py-3 text-sm"
      />
      {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}
