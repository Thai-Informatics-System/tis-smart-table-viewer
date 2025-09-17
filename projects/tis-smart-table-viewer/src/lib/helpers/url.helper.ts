import { Location } from '@angular/common';
import { Router } from '@angular/router';

/**
 * Centralized URL and navigation utility helper.
 * Provides common functions for URL manipulation and navigation.
 */
export class UrlHelper {
  
  /**
   * Extracts the home URL from current window location
   * @returns Home URL path
   */
  static getHomeUrl(): string {
    const pathname = window.location.pathname;
    return `/${pathname.split('/')[1]}`;
  }
  
  /**
   * Safely navigates to a URL if it's valid
   * @param router - Angular Router instance
   * @param url - URL to navigate to
   * @returns Promise<boolean> - Navigation result
   */
  static safeNavigate(router: Router, url: string): Promise<boolean> | null {
    if (!url || typeof url !== 'string') {
      return null;
    }
    
    try {
      return router.navigateByUrl(url);
    } catch (error) {
      console.warn('Navigation error:', error);
      return null;
    }
  }
  
  /**
   * Updates the browser URL without navigation using Location service
   * @param location - Angular Location service
   * @param baseUrl - Base URL path
   * @param queryString - Query string parameters
   */
  static updateUrl(location: Location, baseUrl: string, queryString: string): void {
    const newUrl = `${baseUrl}?${queryString}`;
    const currentUrl = window.location.pathname + window.location.search;
    
    if (currentUrl !== newUrl) {
      location.go(newUrl);
    }
  }
  
  /**
   * Builds a complete URL with query parameters
   * @param baseUrl - Base URL path
   * @param queryParams - URLSearchParams object
   * @returns Complete URL string
   */
  static buildUrl(baseUrl: string, queryParams: URLSearchParams): string {
    const queryString = queryParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }
  
  /**
   * Gets the base URL without query parameters
   * @param router - Angular Router instance
   * @returns Base URL string
   */
  static getBaseUrl(router: Router): string {
    return router.url.split('?')[0];
  }
  
  /**
   * Checks if current URL differs from generated URL
   * @param generatedUrl - Generated URL to compare
   * @returns True if URLs are different
   */
  static hasUrlChanged(generatedUrl: string): boolean {
    const currentUrl = window.location.pathname + window.location.search;
    return currentUrl !== generatedUrl;
  }
  
  /**
   * Extracts query parameters from a URL string
   * @param url - Full URL string
   * @returns URLSearchParams object
   */
  static extractQueryParams(url: string): URLSearchParams | null {
    try {
      const urlObj = new URL(url);
      return new URLSearchParams(urlObj.search);
    } catch (error) {
      console.warn('Invalid URL for query param extraction:', url);
      return null;
    }
  }
  
  /**
   * Handles button click actions (URL navigation or callback execution)
   * @param router - Angular Router instance
   * @param config - Button configuration object
   * @param primaryUrlKey - Primary URL property name (default: 'btnUrl')
   * @param primaryClickKey - Primary click handler property name (default: 'btnClick')
   */
  static handleButtonClick(
    router: Router, 
    config: any, 
    primaryUrlKey: string = 'btnUrl',
    primaryClickKey: string = 'btnClick'
  ): void {
    if (!config) return;
    
    // Try callback first
    if (config[primaryClickKey] && typeof config[primaryClickKey] === 'function') {
      try {
        config[primaryClickKey]();
      } catch (error) {
        console.warn('Error executing button callback:', error);
      }
    } 
    // Fallback to URL navigation
    else if (config[primaryUrlKey]) {
      this.safeNavigate(router, config[primaryUrlKey]);
    }
  }
  
  /**
   * Handles secondary button click actions
   * @param router - Angular Router instance
   * @param config - Button configuration object
   */
  static handleSecondaryButtonClick(router: Router, config: any): void {
    this.handleButtonClick(router, config, 'secondBtnUrl', 'secondBtnClick');
  }
  
  /**
   * Validates if a URL string is properly formatted
   * @param url - URL to validate
   * @returns True if URL is valid
   */
  static isValidUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    
    try {
      // Allow relative URLs starting with '/'
      if (url.startsWith('/')) return true;
      
      // Validate absolute URLs
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Safely encodes URL parameters
   * @param value - Value to encode
   * @returns Encoded string
   */
  static encodeParam(value: any): string {
    if (value === null || value === undefined) return '';
    return encodeURIComponent(String(value));
  }
}
