// RCT_EXTERN registrations for the Swift AircabMesh module.
// Required because Swift method signatures are not auto-exported to the bridge.
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(AircabMesh, RCTEventEmitter)

RCT_EXTERN_METHOD(start:(NSDictionary *)profile
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(stop:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(send:(NSString *)peerId json:(NSString *)json)
RCT_EXTERN_METHOD(broadcast:(NSString *)json)

RCT_EXTERN_METHOD(directPeers:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(addListener:(NSString *)eventName)
RCT_EXTERN_METHOD(removeListeners:(double)count)

@end
