import WidgetKit
import SwiftUI

@main
struct DropWidgetBundle: WidgetBundle {
    var body: some Widget {
        RecordWidget()
        MemoWidget()
        CameraWidget()
        GalleryWidget()
        QuickActionsWidget()
    }
}
