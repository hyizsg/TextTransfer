//
//  TextTransferAppDelegate.m
//  TextTransfer
//
//  Created by Matt Gallagher on 2009/07/13.
//  Copyright Matt Gallagher 2009. All rights reserved.
//
//  Permission is given to use this source code file, free of charge, in any
//  project, commercial or otherwise, entirely at your risk, with the condition
//  that any redistribution (in part or whole) of source code must retain
//  this copyright and permission notice. Attribution in compiled projects is
//  appreciated but not required.
//

#import "TextTransferAppDelegate.h"
#import "TextTransferViewController.h"
#import "HTTPServer.h"

@implementation TextTransferAppDelegate

@synthesize window;
@synthesize viewController;


- (void)applicationDidFinishLaunching:(UIApplication *)application
{    
    // Override point for customization after app launch    
    [window addSubview:viewController.view];
    [window makeKeyAndVisible];
	
//	[[HTTPServer sharedHTTPServer] start];
    [viewController start];
}

- (void)applicationWillTerminate:(UIApplication *)application
{
	[[HTTPServer sharedHTTPServer] stop];
}

- (void)applicationDidBecomeActive:(UIApplication *)application
{
    [[HTTPServer sharedHTTPServer] start];
}

- (void)applicationWillEnterForeground:(UIApplication *)application
{
    [[HTTPServer sharedHTTPServer] stop];
}

- (void)dealloc
{
    
}


@end
