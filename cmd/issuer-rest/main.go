/*
Copyright SecureKey Technologies Inc. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

package main

import (
	"github.com/joho/godotenv"
	"github.com/spf13/cobra"
	"github.com/trustbloc/edge-core/pkg/log"

	"github.com/trustbloc/sandbox/cmd/issuer-rest/startcmd"
)

var logger = log.New("issuer-rest")

func main() {
	_ = godotenv.Load(".env")

	rootCmd := &cobra.Command{
		Use: "issuer",
		Run: func(cmd *cobra.Command, args []string) {
			cmd.HelpFunc()(cmd, args)
		},
	}

	rootCmd.AddCommand(startcmd.GetStartCmd(&startcmd.HTTPServer{}))

	if err := rootCmd.Execute(); err != nil {
		logger.Fatalf("Failed to run issuer: %s", err.Error())
	}
}
