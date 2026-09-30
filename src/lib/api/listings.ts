import { getData, getPage, sendData } from "@/lib/api/client";
import type { Listing, ListingInput, ListingQuery, Offer, PageQuery } from "@/types/api";

export const listingsApi = {
  getListings(params?: ListingQuery, signal?: AbortSignal) {
    return getPage<Listing>("/listings", params, signal);
  },
  getListing(id: string, signal?: AbortSignal) {
    return getData<Listing>(`/listings/${id}`, undefined, signal);
  },
  createListing(payload: ListingInput) {
    return sendData<Listing>("post", "/listings", payload);
  },
  updateListing(id: string, payload: Partial<ListingInput>) {
    return sendData<Listing>("patch", `/listings/${id}`, payload);
  },
  publishListing(id: string) {
    return sendData<Listing>("patch", `/listings/${id}/publish`);
  },
  cancelListing(id: string) {
    return sendData<Listing>("patch", `/listings/${id}/cancel`);
  },
  deleteListing(id: string) {
    return sendData<{ deleted?: boolean } | Listing>("delete", `/listings/${id}`);
  },
  getMyListings(params?: ListingQuery, signal?: AbortSignal) {
    return getPage<Listing>("/farmers/me/listings", params, signal);
  },
  getNearbyListings(params: ListingQuery & { lat: number; lng: number; radius?: number }, signal?: AbortSignal) {
    return getPage<Listing>("/listings/nearby", params, signal);
  },
  search(params?: ListingQuery, signal?: AbortSignal) {
    return getPage<Listing>("/listings/search", params, signal);
  },
  offers(listingId: string, params?: PageQuery, signal?: AbortSignal) {
    return getPage<Offer>(`/listings/${listingId}/offers`, params, signal);
  },
  createOffer(listingId: string, body: { offeredPrice: number; quantity: number; message?: string; expiresAt?: string }) {
    return sendData<Offer>("post", `/listings/${listingId}/offers`, body);
  },
};
