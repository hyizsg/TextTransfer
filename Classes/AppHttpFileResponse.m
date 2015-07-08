//
//  AppHttpFileResponse.m
//  TextTransfer
//
//  Created by John on 15/7/3.
//
//

#import "AppHttpFileResponse.h"
#import "HTTPServer.h"

@implementation AppHttpFileResponse

//
// load
//
// Implementing the load method and invoking
// [HTTPResponseHandler registerHandler:self] causes HTTPResponseHandler
// to register this class in the list of registered HTTP response handlers.
//
+ (void)load
{
    [HTTPResponseHandler registerHandler:self];
}

//
// canHandleRequest:method:url:headerFields:
//
// Class method to determine if the response handler class can handle
// a given request.
//
// Parameters:
//    aRequest - the request
//    requestMethod - the request method
//    requestURL - the request URL
//    requestHeaderFields - the request headers
//
// returns YES (if the handler can handle the request), NO (otherwise)
//
+ (BOOL)canHandleRequest:(CFHTTPMessageRef)aRequest
                  method:(NSString *)requestMethod
                     url:(NSURL *)requestURL
            headerFields:(NSDictionary *)requestHeaderFields
{
    NSLog(@"%@", requestURL);
    return [self fileContentTypeByUrl:requestURL] != nil;
}

+ (NSString*)fileContentTypeByUrl:(NSURL*)url
{
    if ([url.path isEqualToString:@"/"])
    {
        return @"text/html";
    }
    else
    {
        NSString* fileExt = [url.path pathExtension];
        NSString* contentType = NSLocalizedStringFromTable(fileExt, @"ContentType", nil);
        if (![fileExt isEqualToString:contentType]) {
            return contentType;
        }
    }
    
    return nil;
}

+ (NSString*)filePathByUrl:(NSURL*)url
{
    if ([url.path isEqualToString:@"/"])
    {
        NSString* filePath = [[NSBundle mainBundle] pathForResource:@"www/index" ofType:@"html"];
        return filePath;
    }
    else
    {
        NSString* urlPath = [@"www" stringByAppendingPathComponent:url.path];
        NSString* fileName = [urlPath stringByDeletingPathExtension];
        NSString* fileExt = [urlPath pathExtension];
        NSString* filePath = [[NSBundle mainBundle] pathForResource:fileName ofType:fileExt];
        return filePath;
    }
}

//
// startResponse
//
// Since this is a simple response, we handle it synchronously by sending
// everything at once.
//
- (void)startResponse
{
    NSString* contentType = [self.class fileContentTypeByUrl:url];
    NSData *fileData = [NSData dataWithContentsOfFile:[self.class filePathByUrl:url]];
    
    CFHTTPMessageRef response =
    CFHTTPMessageCreateResponse( kCFAllocatorDefault, 200, NULL, kCFHTTPVersion1_1);
    CFHTTPMessageSetHeaderFieldValue(response, (CFStringRef)@"Content-Type", (__bridge CFStringRef)contentType);
    CFHTTPMessageSetHeaderFieldValue(response, (CFStringRef)@"Connection", (CFStringRef)@"close");
    CFHTTPMessageSetBody(response, (__bridge CFDataRef)(fileData));
    CFDataRef headerData = CFHTTPMessageCopySerializedMessage(response);
    
    @try
    {
        [fileHandle writeData:(__bridge NSData *)headerData];
    }
    @catch (NSException *exception)
    {
        // Ignore the exception, it normally just means the client
        // closed the connection from the other end.
    }
    @finally
    {
        CFRelease(headerData);
        [server closeHandler:self];
    }
}

//
// pathForFile
//
// In this sample application, the only file returned by the server lives
// at a fixed location, whose path is returned by this method.
//
// returns the path of the text file.
//
+ (NSString *)pathForFile
{
    NSString *path =
    [NSSearchPathForDirectoriesInDomains(
                                         NSApplicationSupportDirectory,
                                         NSUserDomainMask,
                                         YES)
     objectAtIndex:0];
    BOOL exists = [[NSFileManager defaultManager] fileExistsAtPath:path];
    if (!exists)
    {
        [[NSFileManager defaultManager]
         createDirectoryAtPath:path
         withIntermediateDirectories:YES
         attributes:nil
         error:nil];
    }
    return [path stringByAppendingPathComponent:@"file.txt"];
}

@end
