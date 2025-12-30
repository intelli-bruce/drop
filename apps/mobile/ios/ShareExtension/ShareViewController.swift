//
//  ShareViewController.swift
//  ShareExtension
//

import UIKit

class ShareViewController: RSIShareViewController {

    // Return false if you don't want to redirect to host app automatically
    override func shouldAutoRedirect() -> Bool {
        return true
    }
}
