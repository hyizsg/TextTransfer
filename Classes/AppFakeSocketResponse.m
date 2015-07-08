//
//  AppFakeSocketResponse.m
//  TextTransfer
//
//  Created by John on 15/7/3.
//
//

#import "AppFakeSocketResponse.h"
#import "HTTPServer.h"

@implementation AppFakeSocketResponse

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
    if ([requestURL.path rangeOfString:@"/connect.socket"].location != NSNotFound)
    {
        return YES;
    }
    
    return NO;
}

//
// startResponse
//
// Since this is a simple response, we handle it synchronously by sending
// everything at once.
//

- (void)startResponse
{
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(realStartResponse:)
                                                 name:APP_FAKESOCKET_RESPONSE
                                               object:nil];
}

- (void)endResponse
{
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    [super endResponse];
}

- (void)realStartResponse:(id)notify
{
    NSData *fileData = [notify object];
    
    CFHTTPMessageRef response =
    CFHTTPMessageCreateResponse(kCFAllocatorDefault, 200, NULL, kCFHTTPVersion1_1);
    CFHTTPMessageSetHeaderFieldValue(response, (CFStringRef)@"Content-Type", (CFStringRef)@"text/plain");
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


@end
